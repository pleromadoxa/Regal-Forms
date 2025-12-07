
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Sends an email notification by writing to the 'mail' collection.
 * This pattern relies on a Firebase Extension (like Trigger Email) 
 * or a Cloud Function watching this collection to perform the actual sending.
 */
export const sendEmail = async (to: string | string[], subject: string, html: string) => {
    try {
        const recipients = Array.isArray(to) ? to : [to];
        
        // Don't attempt to write if no recipients
        if (recipients.length === 0 || !recipients[0]) return;

        await addDoc(collection(db, 'mail'), {
            to: recipients,
            message: {
                subject: subject,
                html: html,
            },
            createdAt: serverTimestamp(),
        });
        
        console.log(`Email notification queued for: ${recipients.join(', ')}`);
    } catch (error) {
        // We log but don't throw, as email failure shouldn't block the UI flow
        console.error("Failed to queue email notification:", error);
    }
};

export const generateEmailTemplate = (title: string, body: string, actionLink?: string, actionText?: string) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #f27f0d; margin: 0;">Regal Forms</h1>
            </div>
            <h2 style="color: #333; font-size: 20px;">${title}</h2>
            <div style="color: #555; line-height: 1.6; margin-bottom: 24px;">
                ${body}
            </div>
            ${actionLink ? `
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${actionLink}" style="background-color: #f27f0d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        ${actionText || 'View Details'}
                    </a>
                </div>
            ` : ''}
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 32px;" />
            <p style="text-align: center; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} Regal Forms. All rights reserved.
            </p>
        </div>
    `;
};
