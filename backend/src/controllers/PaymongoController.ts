import type { Response, Request } from "express";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

export async function Payment(req: Request, res: Response){
    try {
        const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(process.env.PAYMONGO_SECRET_KEY + ':')
        },
        body: JSON.stringify({
            data: {
            attributes: {
                amount: 10000,
                currency: 'PHP',
                payment_method_allowed: ['card'],
                description: 'Order #1234'
            }
            }
        })
        });
        const intent = await response.json();
        return intent;
    } catch (error) {
        return sendErrorResponse(res, error, "Paymongo API call error.");
    }
}