package com.example.roflparser.exception;

public class DuplicateMatchException extends RuntimeException {

    public DuplicateMatchException() {
        super("이미 등록된 경기입니다.");
    }

    public DuplicateMatchException(String message) {
        super(message);
    }
}
