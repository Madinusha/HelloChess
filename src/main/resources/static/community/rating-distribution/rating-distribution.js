document.addEventListener('DOMContentLoaded', function () {
//    const ratingData = JSON.parse(document.getElementById('ratingData').value);
    const ratingData = generateNormalDistribution(1000, 1600, 200); // Используйте реальные данные вместо фейковых
    const currentUserRating = parseInt(document.getElementById('currentUserRating').value);
//    const averageRating = parseFloat(document.getElementById('averageRating').value);
    const averageRating = 1600;
    if (!ratingData || !currentUserRating || !averageRating) {
        console.error('Не удалось загрузить данные для графика');
        return;
    }

    // Парсим диапазоны рейтингов
    const labels = ratingData.map(item => {
        const match = item.range.match(/(\d+)-/);
        return match ? parseInt(match[1]) : 0;
    });

    const playerCounts = ratingData.map(item => item.count);
    const maxPlayerCount = Math.max(...playerCounts);

    // Настраиваем S-кривую (вероятность победы над средним игроком)
    const k = 0.008; // Меньше крутизна = плавнее рост
    const x0 = averageRating; // Центр кривой = средний рейтинг

    // S-кривая теперь растет от 0% до 100% плавно
    const winProbability = labels.map(x => {
        const prob = 100 / (1 + Math.exp(-k * (x - x0)));
        return Math.min(100, Math.max(0, prob)); // Ограничиваем 0-100%
    });

    const ctx = document.getElementById('ratingChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Количество игроков',
                    data: playerCounts,
                    borderColor: 'rgba(85, 58, 76, 1)',
                    backgroundColor: 'rgba(85, 58, 76, 0.4)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: 'rgba(85, 58, 76, 1)',
                    yAxisID: 'y'
                },
                {
                    label: 'Всего (%)',
                    data: winProbability,
                    borderColor: 'rgba(203, 172, 152, 1)',
                    backgroundColor: 'rgba(0, 0, 0, 0)', // Прозрачный фон
                    borderDash: [5, 5],
                    tension: 0.3,
                    pointRadius: 0,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Рейтинг' },
                    min: Math.min(...labels) - 50, // Добавляем отступ слева
                    max: Math.max(...labels) + 50 // Добавляем отступ справа
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Количество игроков' },
                    suggestedMax: maxPlayerCount * 1.2 // Оставляем место для аннотаций
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Всего (%)' },
                    min: 0,
                    max: 100,
                    grid: { drawOnChartArea: false }
                }
            },
            plugins: {
                annotation: {
                    annotations: {
                        userRatingLine: {
                            type: 'line',
                            yMin: 0,
                            yMax: maxPlayerCount,
                            xMin: currentUserRating,
                            xMax: currentUserRating,
                            borderColor: 'rgb(199, 49, 54)',
                            borderWidth: 3,
                            label: {
                                content: `ВЫ: ${currentUserRating}`,
                                enabled: true,
                                position: 'top',
                                backgroundColor: 'rgba(199, 49, 54, 0.8)',
                                color: 'white',
                                font: { weight: 'bold' }
                            }
                        },
                        averageLine: {
                            type: 'line',
                            yMin: 0,
                            yMax: maxPlayerCount,
                            xMin: averageRating,
                            xMax: averageRating,
                            borderColor: 'rgba(75, 192, 192, 0.7)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                content: `Среднее: ${Math.round(averageRating)}`,
                                enabled: true,
                                position: 'bottom'
                            }
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.datasetIndex === 0) {
                                label += context.raw + ' игроков';
                            } else {
                                label += Math.round(context.raw) + '%';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
});


// Функция генерации нормального распределения (оставлена для тестирования)
function generateNormalDistribution(n, mean = 0, stdDev = 1) {
    function randomNormal() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return num * stdDev + mean;
    }

    const data = Array.from({ length: n }, randomNormal);

    // Группируем по шагу 25
    const step = 25;
    const min = Math.floor(Math.min(...data) / step) * step;
    const max = Math.ceil(Math.max(...data) / step) * step;

    const bins = {};
    for (let i = min; i <= max; i += step) {
        const start = i;
        const end = i + step - 1;
        const key = `${start}-${end}`;
        bins[key] = 0;
    }

    data.forEach(val => {
        const binStart = Math.floor(val / step) * step;
        const binEnd = binStart + step - 1;
        const key = `${binStart}-${binEnd}`;
        if (bins[key] !== undefined) {
            bins[key]++;
        }
    });

    return Object.entries(bins).map(([range, count]) => ({
        range,
        count
    }));
}