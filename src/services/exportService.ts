import { Conversation } from "@/types";

export const exportService = {
    exportToMarkdown(conversation: Conversation) {
        let content = `# ${conversation.title}\n\n`;
        content += `**Date:** ${new Date(conversation.created_at).toLocaleString()}\n`;
        content += `**Model:** ${conversation.metadata.model}\n\n`;
        content += `---\n\n`;

        conversation.messages.forEach(msg => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            content += `### ${role}\n\n${msg.content}\n\n`;
            if (msg.citations && msg.citations.length > 0) {
                content += `> **Citations:**\n`;
                msg.citations.forEach((c, i) => {
                    content += `> [${i + 1}] ${c.text}\n`;
                });
                content += `\n`;
            }
            content += `---\n\n`;
        });

        downloadFile(content, `conversation-${conversation.id}.md`, 'text/markdown');
    },

    exportCitations(conversation: Conversation) {
        let content = "";
        let count = 0;
        conversation.messages.forEach(msg => {
            if (msg.citations) {
                msg.citations.forEach((c) => {
                    count++;
                    content += `[${count}] ${c.text}\n`;
                });
            }
        });

        if (!content) {
            return false; // No citations
        }

        downloadFile(content, `citations-${conversation.id}.txt`, 'text/plain');
        return true;
    }
};

function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
