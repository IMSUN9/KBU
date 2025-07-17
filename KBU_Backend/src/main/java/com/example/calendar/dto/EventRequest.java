package com.example.calendar.dto;

public class EventRequest
{
    public String title;
    public String type;
    public String date;       // 프론트에서는 문자열로 전달됨 (예: "2025-06-22")
    public String description;

    // ✅ Getter & Setter
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
