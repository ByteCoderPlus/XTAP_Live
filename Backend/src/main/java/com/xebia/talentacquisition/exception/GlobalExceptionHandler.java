package com.xebia.talentacquisition.exception;

import com.xebia.talentacquisition.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        ErrorResponse.ErrorInfo errorInfo = ErrorResponse.ErrorInfo.builder()
                .code("RUNTIME_ERROR")
                .message(ex.getMessage())
                .build();
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error(errorInfo)
                .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ErrorResponse.ErrorInfo errorInfo = ErrorResponse.ErrorInfo.builder()
                .code("VALIDATION_ERROR")
                .message("Validation failed")
                .details(errors)
                .build();
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error(errorInfo)
                .build();
        
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse.ErrorInfo errorInfo = ErrorResponse.ErrorInfo.builder()
                .code("INTERNAL_ERROR")
                .message(ex.getMessage() != null ? ex.getMessage() : "Internal server error")
                .build();
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error(errorInfo)
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}
