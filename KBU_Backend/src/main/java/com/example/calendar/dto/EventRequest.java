package com.example.calendar.dto;

public class EventRequest
{
    public String title;
    public String type;
    public String date;       // 프론트에서는 문자열로 전달됨 (예: "2025-06-22")
    public String description;
}
