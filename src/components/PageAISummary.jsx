import React, { useState, useEffect } from 'react';
import { generateTop10MoviesSummary, generateTop10ActorsSummary } from '../utils/aiSummaryGenerator';
import './PageAISummary.css';
import { marked } from "marked";
import DOMPurify from "dompurify";

const PageAISummary = ({ data, type = 'movie' }) => {
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchSummary = async () => {
            if (!data || data.length === 0) return;

            setIsLoading(true);
            setError(false);

            try {
                let generatedSummary;
                if (type === 'movie') {
                    generatedSummary = await generateTop10MoviesSummary(data);
                } else {
                    generatedSummary = await generateTop10ActorsSummary(data);
                }
                setSummary(generatedSummary);
            } catch (err) {
                console.error('Error generating page summary:', err);
                setError(true);
                setSummary(type === 'movie'
                    ? "The cinematic landscape is constantly evolving, with these top titles leading the charge in entertainment this week."
                    : "These talented performers are currently capturing audiences' attention worldwide with their remarkable screen presence."
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchSummary();
    }, [data, type]);

    if (!data || data.length === 0) return null;

    if (isLoading) {
        return (
            <div className="page-ai-summary loading">
                <div className="page-ai-header">
                    <div className="glow-icon spinning">🤖</div>
                    <h3>Chalchitra Insights</h3>
                </div>
                <div className="loading-pulse">Analyzing the current trends...</div>
            </div>
        );
    }

    return (
        <div className="page-ai-summary">
            <div className="page-ai-header">
                <div className="glow-icon">✨</div>
                <h3>Chalchitra Insights</h3>
            </div>
            <div
                className="page-ai-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(summary || "")) }}
            />
        </div>
    );
};

export default PageAISummary;
