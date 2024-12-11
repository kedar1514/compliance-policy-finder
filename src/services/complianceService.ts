import { OpenAI } from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { compplainPolicyText } from '../constants/constants';


const checkForComplianceIssues = async (pageContent: string, policyContent: string) => {
    const openai = new OpenAI({
        apiKey: 'your-openai-api-key',  // Replace with your actual OpenAI API key
    });

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a compliance expert who checks content for policy violations.', // here i am have given system prompt to LLM
                },
                {
                    role: 'user',
                    content: `Please compare the following webpage content against the compliance policy and identify any non-compliance issues:\n\nWebpage Content: \n${pageContent}\n\nCompliance Policy: \n${policyContent}`, // here i have given web page content and complaint plolicy content
                },
            ],
        });

        const issues = response.choices[0]?.message?.content || '';
        return issues ? { compliant: false, issues: [issues] } : { compliant: true, issues: [] };
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`OpenAI error: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while checking compliance.');
        }
    }
};

// Main function to check Mercury's content against Stripe's policy
export const checkCompliance = async (testUrl: string) => {
    try {
        const webPageContent = await fetchWebpageContent(testUrl);
        
        const complianceResults = await checkForComplianceIssues(webPageContent, compplainPolicyText);
        return complianceResults;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Error occurred: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while checking compliance.');
        }
    }
};

export const fetchWebpageContent = async (url: string) => {
    try {
        const response = await axios.get(url);

        if (!response || !response.data) {
            throw new Error('Empty response or no data found');
        }

        const $ = cheerio.load(response.data);
        
        // i was getting mostly garbage data so tried removing few scripts and style data
        // this can be easily achieved by BeautifulSoap in python, i am using beautifulSoap for website extraction in current org
        $('script, style, noscript, link').remove();
        $('[style]').removeAttr('style');

        const bodyText = $('body').text().trim();
        return bodyText;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch the webpage: ${error.message}`);
        } else {
            throw new Error('An unknown error occurred while fetching the webpage.');
        }
    }
};