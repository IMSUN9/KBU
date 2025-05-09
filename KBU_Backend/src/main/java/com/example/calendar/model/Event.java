package com.example.calendar.model;

// 클라이언트와 데이터를 주고받을 때 사용하는 단순 모델 클래스 (DTO 역할)
public class Event {
    // 일정 제목
    private String title;

    // 일정 종류 (예: Work, Sports, Friend, Other)
    private String type;

    // 일정 날 (yyyy-MM-dd 형식의 문자열)
    private String date;

    // 기본 생성자 (반드시 필요: Spring에서 객체  변환할 떄 사용)
    public Event()
    {

    }

    // 모든 필드를 받는 생성자
    public Event(String title, String type, String date)
    {
        this.title = title;
        this.type = type;
        this.date = date;
    }

    // Getter와 Setter 메서드들
    // title 필드에 접근하기 위한 메서드
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    // type 필드에 접근하기 위한 메서드
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    // date 필드에 접근하기 위한 메서드
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
