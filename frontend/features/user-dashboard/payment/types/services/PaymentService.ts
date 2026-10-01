export async function createPayment() {
    try {
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
                    card_number: '4343434343434345',
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
        const paymentMethod = await response.json();
        return paymentMethod
    } catch (error) {
        console.error(error)
    }
}

async function() {

}