import { api } from "@/lib/axios";


export async function createPayment() {
    try {
        const {data} = await api.get(`/api/paymongo/`)
        const client_key = data.data.attributes.client_key
        const paymentIntentId = data.data.id

        const response = await fetch('https://api.paymongo.com/v1/payment_methods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(process.env.NEXT_PUBLIC_PAYMONGO_SECRET_KEY!)
            },
            body: JSON.stringify({
                data: {
                attributes: {
                    type: 'card',
                    details: {
                    card_number: '4120000000000007',
                    exp_month: 12,
                    exp_year: 2030,
                    cvc: '123'
                    },
                    billing: {
                    name: 'Juan dela Cruz',
                    email: 'juan@example.com',
                    phone: '09171234567',
                    address: {
                        line1: '123 Main Street',
                        city: 'Manila',
                        state: 'Metro Manila',
                        postal_code: '1000',
                        country: 'PH'
                    }
                    }
                }
                }
            })
            });

            const {data: paymentMethod} = await response.json()

            const id = paymentMethod.id
        
        const attachResponse = await fetch(
            `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
            {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(process.env.NEXT_PUBLIC_PAYMONGO_SECRET_KEY!)
                },
                body: JSON.stringify({
                data: {
                    attributes: {
                    payment_method: id,
                    client_key: client_key,
                    return_url: 'https://yoursite.com/payment/complete'
                    }
                }
                })
            }
        );
        const intent = await attachResponse.json();

        if (intent.data.attributes.status === 'awaiting_next_action') {
            const redirectUrl = intent.data.attributes.next_action.redirect.url;
            console.log(redirectUrl)
            window.location.href = redirectUrl;
        }
    } catch (error) {
        console.error(error)
    }
}