package com.example.calendar.dto;

import java.time.LocalDate;

public class EventDto {
    public Long id;
    public String title;
    public String type;
    public LocalDate date;
    public boolean completed;
    public String description;

    public EventDto(Long id, String title, String type, LocalDate date, boolean completed, String description) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.date = date;
        this.completed = completed;
        this.description = description;
    }
}
