/**
 * AWS Lambda handler for Express API
 * Simple working handler for testing
 */

export const handler = async (event, context) => {
    console.log('Lambda handler invoked:', event.httpMethod, event.path);
    
    // Keep Lambda warm
    context.callbackWaitsForEmptyEventLoop = false;
    
    try {
        const response = {
            ok: true,
            message: 'Lambda API working',
            data: {
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                path: event.path,
                method: event.httpMethod
            }
        };
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization'
            },
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error('Lambda handler error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                ok: false,
                message: 'Internal server error',
                data: { error: error.message }
            })
        };
    }
};