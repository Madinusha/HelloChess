package org.madi.demo.dto;

import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChessTaskData {
    private Map<String, Object> initialFen;
    private List<String> solutionMoves;
}
