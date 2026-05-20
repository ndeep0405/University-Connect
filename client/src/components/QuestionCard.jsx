import { Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../utils/api';

const QuestionCard = ({ question, onDelete }) => {
  const questionId = question.id || question._id;
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const user = localStorage.getItem('uc_user') ? JSON.parse(localStorage.getItem('uc_user')) : null;

  const isOwner = user?.id === question.postedBy?.id;
  const isAdmin = user?.role === 'admin';
  const canDelete = isOwner || isAdmin;

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError('');
    try {
      console.log('Deleting question', questionId);
      const response = await api.delete(`/questions/${questionId}`);
      console.log('Question deleted successfully', response.data);
      if (onDelete) {
        onDelete(questionId);
      }
    } catch (err) {
      // Extract error message from various possible locations
      const errorMsg = 
        err.response?.data?.message || 
        err.response?.statusText || 
        err.message || 
        'Unable to delete question';
      
      console.error('Delete error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        fullError: err
      });
      
      setError(errorMsg);
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <Link
      to={`/questions/${questionId}`}
      state={{ question }}
      className="group block overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            {question.department}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-slate-600">
            {question.subject}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">{question.answerCount || 0} answers</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{question.views || 0} views</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-3 line-clamp-2">
          {question.title}
        </h3>
        <p className="text-sm leading-6 text-slate-600 line-clamp-3 mb-6">
          {question.body}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-500">
          <span className="font-medium text-slate-700">By {question.postedBy?.name || 'Unknown'}</span>
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isDeleting
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600 transition group-hover:bg-slate-200">
              View question
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default QuestionCard;
