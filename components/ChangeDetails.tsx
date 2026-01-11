
import React, { useState, useEffect } from 'react';
import { ChangeList, AIReview } from '../types';
import { getAIReview } from '../services/geminiService';

interface ChangeDetailsProps {
  change: ChangeList;
  onBack: () => void;
}

const ChangeDetails: React.FC<ChangeDetailsProps> = ({ change, onBack }) => {
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState(change.files[0] || null);

  const fetchReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const review = await getAIReview(change);
      setAiReview(review);
    } catch (err) {
      setError("Failed to generate AI Review. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // We don't auto-fetch to save tokens, but user can trigger it
  }, [change]);

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'bg-green-100 text-green-700';
      case 'NEGATIVE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
            Reply
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
            Merge
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{change.subject}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
              <span className="flex items-center">
                <span className="font-semibold text-gray-700 mr-1">Project:</span> {change.project}
              </span>
              <span className="flex items-center">
                <span className="font-semibold text-gray-700 mr-1">Branch:</span> {change.branch}
              </span>
              <span className="flex items-center">
                <span className="font-semibold text-gray-700 mr-1">Owner:</span> {change.owner}
              </span>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Modified Files</h3>
              <div className="space-y-2">
                {change.files.map(file => (
                  <button 
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      selectedFile?.path === file.path 
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className={`w-4 h-4 mr-3 ${file.status === 'ADDED' ? 'text-green-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{file.path}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      file.status === 'ADDED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {file.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Diff Viewer Simulation */}
          {selectedFile && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <span className="text-xs font-mono text-gray-600">{selectedFile.path}</span>
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                </div>
              </div>
              <div className="p-4 bg-gray-900 overflow-x-auto">
                <pre className="text-xs font-mono text-gray-300">
                  {selectedFile.content.split('\n').map((line, i) => (
                    <div key={i} className="flex hover:bg-gray-800 transition-colors">
                      <span className="w-10 text-gray-600 text-right pr-4 select-none">{i + 1}</span>
                      <span className={`${line.startsWith('+') ? 'text-green-400 bg-green-900/30 w-full' : line.startsWith('-') ? 'text-red-400 bg-red-900/30 w-full' : ''}`}>
                        {line}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / AI Review */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                </svg>
                GeritAI Review
              </h3>
              {!aiReview && !loading && (
                <button 
                  onClick={fetchReview}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Run Analysis
                </button>
              )}
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-sm text-gray-500 animate-pulse">Consulting Gemini...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {aiReview && !loading && (
              <div className="space-y-6">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase">Analysis Summary</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSentimentBadge(aiReview.overallSentiment)}`}>
                      {aiReview.overallSentiment}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {aiReview.summary}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Suggestions ({aiReview.suggestions.length})</h4>
                  {aiReview.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-indigo-200 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-gray-400 truncate max-w-[120px]">
                          {suggestion.file}{suggestion.line ? `:${suggestion.line}` : ''}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getSeverityBadge(suggestion.severity)}`}>
                          {suggestion.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{suggestion.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!aiReview && !loading && (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">
                  Ready to analyze this patch set for potential issues and style improvements.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeDetails;
