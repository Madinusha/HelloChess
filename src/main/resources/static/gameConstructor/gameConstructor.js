const players = [
    {nickname: "Bull_Digga", rating: 1650, time: "3 + 2"},
    {nickname: "madi_nusha", rating: 2100, time: "15 + 10"}
];

const tableBody = document.querySelector('.table-body');
players.forEach(player => {
    const row = document.createElement('div');
    row.className = 'player-row';
    row.innerHTML = `
        <div class="column nickname">${player.nickname}</div>
        <div class="column rating">${player.rating}</div>
        <div class="column time-control">${player.time}</div>
    `;
    tableBody.appendChild(row);
});