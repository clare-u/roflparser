package com.example.roflparser.exception;

import lombok.Getter;

@Getter
public class ApiErrorResponse {
    private final String message;

    public ApiErrorResponse(String message) {
        this.message = message;
    }

}
