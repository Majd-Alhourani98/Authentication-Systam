class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    // Set the HTTP status code for the error (e.g., 400 for bad request, 500 for server error).
    this.statusCode = statusCode;

    // Determine the status based on the status code. If the status code starts with 4 (client error),
    // set the status to 'fail'. Otherwise, set it to 'error' (e.g., server error).
    this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';

    // Mark the error as operational, meaning it is expected and should be handled by the application.
    this.isOperational = true;

    // Capture the stack trace for the error, excluding the constructor call from the trace.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

/* 
  ! Breakdown of AppError class 
  
  1. Constuctor 
    - message: a string that describe the error 
    - statusCode: An HTTP status Code associated with the error 

  2. super(message): Calls the constructor of the `Error` class with the error message. 

  3. this.statusCode: Set the HTTP status code for the error 

  4. this.status: Detrmines the error status based on the status code. it set it to `fail` for client errors (status codes starting with 4) and `error` for server errors(status codes starting with 5)

  5. this.isOperational: A flag indicating whether the error is operational or programming error. useful for distingushing between expected and unexpected Error 

  6. Error.captureStackTrace(this, this.constructor): Caputer a stack trace. 

*/

/* 
  ! Distingushing Error Types:
   - Operational Errors: These are erros that occur during normal application operation, such as validation failures on invalid user input. THESE ERROR ARE EXPECTED. 

   - Programmers Errors: These indicate bugs or unexpected conditions in the code, such as missing files or database connection issues. They are often NOT EXPECTED.

   ! Benfits of is Operational: 
   By setting `isOperational` to true for operational errors, so you can easily distinguish them from programmer errors.

   1. User-Friendly Responses
    - For operational erros, you can provide more user-friendly and informative error messages that help users understand what went worng and how to correct it. errors such as: form validation errors. 

    - For programmer Errors, you might want to log detailed error information for developers but return a generic error message to the client, avoiding exposure of internal application details.

*/
