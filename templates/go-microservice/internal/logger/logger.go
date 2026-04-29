package logger

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

type Level string

const (
	DEBUG Level = "DEBUG"
	INFO  Level = "INFO"
	WARN  Level = "WARN"
	ERROR Level = "ERROR"
)

type LogEntry struct {
	Timestamp string                 `json:"timestamp"`
	Level     Level                  `json:"level"`
	Message   string                 `json:"message"`
	Fields    map[string]interface{} `json:"fields,omitempty"`
}

type Logger struct {
	service string
}

func New(service string) *Logger {
	return &Logger{service: service}
}

func (l *Logger) log(level Level, msg string, fields map[string]interface{}) {
	entry := LogEntry{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Level:     level,
		Message:   msg,
		Fields:   fields,
	}

	// Add service name to fields
	if entry.Fields == nil {
		entry.Fields = make(map[string]interface{})
	}
	entry.Fields["service"] = l.service

	jsonBytes, err := json.Marshal(entry)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to marshal log entry: %v\n", err)
		return
	}

	fmt.Println(string(jsonBytes))
}

func (l *Logger) Debug(msg string, fields map[string]interface{}) {
	l.log(DEBUG, msg, fields)
}

func (l *Logger) Info(msg string, fields map[string]interface{}) {
	l.log(INFO, msg, fields)
}

func (l *Logger) Warn(msg string, fields map[string]interface{}) {
	l.log(WARN, msg, fields)
}

func (l *Logger) Error(msg string, fields map[string]interface{}) {
	l.log(ERROR, msg, fields)
}

// Convenience methods with default fields
func (l *Logger) WithRequestID(requestID string) *LoggerWithRequest {
	return &LoggerWithRequest{
		logger:    l,
		requestID: requestID,
	}
}

type LoggerWithRequest struct {
	logger    *Logger
	requestID string
}

func (l *LoggerWithRequest) log(level Level, msg string, fields map[string]interface{}) {
	if fields == nil {
		fields = make(map[string]interface{})
	}
	fields["request_id"] = l.requestID
	l.logger.log(level, msg, fields)
}

func (l *LoggerWithRequest) Debug(msg string) { l.log(DEBUG, msg, nil) }
func (l *LoggerWithRequest) Info(msg string)  { l.log(INFO, msg, nil) }
func (l *LoggerWithRequest) Warn(msg string)  { l.log(WARN, msg, nil) }
func (l *LoggerWithRequest) Error(msg string) { l.log(ERROR, msg, nil) }
