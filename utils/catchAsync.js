const catchAsync = fn => {
  return (req, res, next) => {
    // fn(req, res, next).catch(err => next(err));
    // simplimfied
    fn(req, res, next).catch(next); //  `next` will be called with the error
  };
};

module.exports = catchAsync;

/* 
 ! Understanding catchAsync
  in Express, Middleware functions are functions that have the following signature: 
  *  function (req, res, next) { }

  this means they accept three parameters: 
  - req: The request object 
  - res: The response object 
  - next: A callback function to pass to the next middleware 

  ! Purpose of catchAsync 
  The Overall purpose of catchAsync is to streamline error handling in asynchronours route handlers and middleware in in Express applications. it does so by:
    1. Removing 'try/catch' blocks: Simplifying the code in the route handlers or middleware by removing the need for repatitive 'try/catch' blocks. This keeps the controller or route handler functions clean and focused on their logic rather than on error handling. 

    2. Handling Errors: Ensuring that any errors thrown from asynchronous functions are properly caught and passed to Express's error-handling middleware. This prevents unhandled promise rejections. 

  ! Detailed Explanation 
    - Wrapping Asynchronous Functions: `catchAsync` wraps an asynchornous functions, which can be a route handler or middleware, allowing it to handle promises and errors more efficiently. 

    - Using Middleware Signature: `catchAsync` It returns a new function that  adheres to the Express middleware signature (req, res, next), enabling it to be used seamlessly in Express route definitions.




  ! our controller structure  without catchAsync 
    const handler = (req, res, next) => { 
        try{
          our logic 
        } catch(err){
          error logic 
        }  
    }

   ! our controller structure  with catchAsync 
    const handler =catchAsync((req, res, next) => { 
          our logic 
    });


*/
