package org.madi.demo.enums;

import lombok.Getter;

@Getter
public enum LanguageLevel {
    NATIVE("родной"),
    ADVANCED("продвинутый"),
    INTERMEDIATE("средний"),
    BEGINNER("начальный");

    private final String displayName;

    LanguageLevel(String displayName) {
        this.displayName = displayName;
    }

    public static LanguageLevel fromDisplayName(String displayName) {
        for (LanguageLevel level : values()) {
            if (level.getDisplayName().equalsIgnoreCase(displayName)) {
                return level;
            }
        }
        throw new IllegalArgumentException("Unknown language level: " + displayName);
    }
}