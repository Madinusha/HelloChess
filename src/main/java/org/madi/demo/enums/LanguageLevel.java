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

    public static LanguageLevel fromDisplayName(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        try {
            return LanguageLevel.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e1) {

            for (LanguageLevel level : values()) {
                if (level.getDisplayName().equalsIgnoreCase(value)) {
                    return level;
                }
            }

            String upperValue = value.toUpperCase();
            if (upperValue.equals("РОДНОЙ")) return NATIVE;
            if (upperValue.equals("ПРОДВИНУТЫЙ")) return ADVANCED;
            if (upperValue.equals("СРЕДНИЙ")) return INTERMEDIATE;
            if (upperValue.equals("НАЧАЛЬНЫЙ")) return BEGINNER;

            throw new IllegalArgumentException("Unknown language level: " + value);
        }
    }

    public static LanguageLevel fromString(String value) {
        return fromDisplayName(value);
    }
}