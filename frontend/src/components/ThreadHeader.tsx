import React from 'react';
import { motion } from 'framer-motion';
import UserAvatar from './UserAvatar';
import { formatDate } from '../utils/dateUtils';
import { ThreadDetail } from '../api/threadsApi';

interface ThreadHeaderProps {
    thread: ThreadDetail;
    userName?: string;
    userAvatarUrl?: string;
    onSummarizeClick: () => void;
}

const ThreadHeader: React.FC<ThreadHeaderProps> = ({
    thread,
    userName,
    userAvatarUrl,
    onSummarizeClick,
}) => {
    // 1. חילוץ בטוח של אובייקט הכותב
    const authorObj = typeof thread.author === 'object' && thread.author !== null ? thread.author : null;

    // 1. חילוץ שם הכותב (תומך באובייקט, בשדה שטוח, או בטקסט ישיר)
    const displayAuthorName =
        typeof thread.author === 'object' && thread.author !== null
            ? (thread.author as any).name
            : (thread.author || (thread as any).authorName || 'User');

    // 2. 🔥 הפתרון: חילוץ האווטאר בכל נתיב אפשרי - בדיוק כמו שעשית בתגובות!
    const displayAuthorAvatar =
        (typeof thread.author === 'object' && thread.author !== null ? (thread.author as any).avatarUrl : undefined) ||
        (thread as any).authorAvatarUrl ||  // <-- מחפש שדה שטוח כמו בתגובות
        (thread as any).avatarUrl ||        // <-- גיבוי נוסף
        undefined;

    // 🔍 שורת דיבאג קריטית מעודכנת
    console.log('--- Thread Header Avatar Debug ---', {
        authorField: thread.author,
        resolvedName: displayAuthorName,
        resolvedAvatar: displayAuthorAvatar,
        currentLoggedInUser: userName,
        currentLoggedInAvatar: userAvatarUrl
    });

    return (
        <article className="thread-detail-card">
            <h1>{thread.title}</h1>
            <p>{thread.content}</p>

            <div className="thread-meta-block" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                <UserAvatar name={displayAuthorName} avatarUrl={displayAuthorAvatar} size={36} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.3' }}>
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>By {displayAuthorName}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{formatDate(thread.createdAt)}</span>
                </div>
            </div>
        </article>
    );
};

export default ThreadHeader;