import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const QuestionDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuestion = location.state?.question || null;
  const [question, setQuestion] = useState(initialQuestion);
  const [answerBody, setAnswerBody] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [loading, setLoading] = useState(!initialQuestion);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const user = localStorage.getItem('uc_user') ? JSON.parse(localStorage.getItem('uc_user')) : null;

  const loadQuestion = async () => {
    setLoading(true);
    setFetchError('');
    console.log('Fetching question', id);
    try {
      const { data } = await api.get(`/questions/${id}`);
      setQuestion(data);
    } catch (err) {
      console.error('Question fetch failed', err);
      const fetchErrorMessage = err.response?.data?.message || err.message || 'Unable to load question';
      if (!initialQuestion && !question) {
        setFetchError(fetchErrorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [id]);

  const submitAnswer = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await api.post(`/questions/${id}/answers`, { body: answerBody });
      setAnswerBody('');
      await loadQuestion();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Unable to post answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (answerId) => {
    try {
      await api.put(`/answers/${answerId}/upvote`);
      loadQuestion();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (answerId) => {
    try {
      await api.put(`/answers/${answerId}/verify`);
      loadQuestion();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (answerId) => {
    if (!window.confirm('Delete this answer?')) return;
    try {
      await api.delete(`/answers/${answerId}`);
      await loadQuestion();
    } catch (err) {
      console.error('Unable to delete answer', err);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    try {
      console.log('Deleting question', id);
      const response = await api.delete(`/questions/${id}`);
      console.log('Question deleted successfully', response.data);
      navigate('/', { replace: true });
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
      
      setDeleteError(errorMsg);
      setIsDeleting(false);
    }
  };

  const answers = Array.from(new Map((question?.answers || []).map((answer) => [answer.id || answer._id, answer])).values());

  const isQuestionOwner = user?.id === question?.postedBy?.id;
  const isAdmin = user?.role === 'admin';
  const canDeleteQuestion = isQuestionOwner || isAdmin;

  if (loading && !question) {
    return <div className="text-center text-slate-500">Loading question...</div>;
  }

  if (fetchError && !question) {
    return <div className="text-center text-red-600">{fetchError}</div>;
  }

  if (!question) {
    return <div className="text-center text-slate-500">Question not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200 p-8 shadow-xl shadow-slate-200/30">
        {fetchError && (
          <div className="mb-5 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {fetchError}
          </div>
        )}
        {deleteError && (
          <div className="mb-5 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            ⚠️ {deleteError}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-5">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{question.department}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{question.subject}</span>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{question.title}</h1>
            <p className="mt-4 text-slate-700 leading-7 whitespace-pre-line">{question.body}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm min-w-fit">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 font-semibold">{answers.length}</span>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Answers</div>
                <div className="mt-1 text-sm text-slate-800">{question.views ?? 0} views</div>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 text-sm text-slate-500">
              Posted by <span className="font-medium text-slate-900">{question.postedBy?.name}</span>
            </div>
            {canDeleteQuestion && (
              <button
                onClick={handleDeleteQuestion}
                disabled={isDeleting}
                className={`w-full mt-4 rounded-full px-4 py-2 font-semibold transition text-sm ${
                  isDeleting
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-rose-600 text-white hover:bg-rose-700'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete Question'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Answers</h2>
            {answers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">No answers yet. Be the first to answer.</div>
            ) : (
              <div className="space-y-4">
                {answers.map((answer) => {
                  const answerId = answer.id || answer._id;
                  return (
                    <div key={answerId} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                          <p className="font-semibold text-slate-900">{answer.postedBy?.name}</p>
                          <p className="text-xs text-slate-500">{answer.postedBy?.role} • {answer.postedBy?.department}</p>
                        </div>
                        {answer.isVerified && <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">Verified</span>}
                      </div>
                      <p className="text-slate-700 whitespace-pre-line leading-7">{answer.body}</p>
                      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <button onClick={() => handleUpvote(answerId)} className="rounded-full bg-white px-4 py-2 border border-slate-200 hover:bg-slate-100 transition">Upvote ({answer.upvotes?.length || 0})</button>
                        {user?.role === 'faculty' && !answer.isVerified && (
                          <button onClick={() => handleVerify(answerId)} className="rounded-full bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition">Mark Verified</button>
                        )}
                        {user?.id === answer.postedBy?.id && (
                          <button onClick={() => handleDelete(answerId)} className="rounded-full bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 transition">Delete</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Post an Answer</h2>
            {submitError && <p className="text-red-600 mb-3">{submitError}</p>}
            <form className="space-y-4" onSubmit={submitAnswer}>
              <textarea
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                className="w-full rounded-[1.5rem] border border-slate-300 px-4 py-4 min-h-[160px] text-slate-700 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
                placeholder="Share your answer"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={`rounded-2xl px-6 py-3 text-white font-semibold transition ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}
              >
                {isSubmitting ? 'Posting answer...' : 'Submit Answer'}
              </button>
            </form>
          </div>
        </section>

        <aside className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Question Details</h2>
          <p className="text-sm text-slate-600">Department: {question.department}</p>
          <p className="text-sm text-slate-600">Subject: {question.subject}</p>
          <p className="text-sm text-slate-600">Asked by: {question.postedBy?.name}</p>
          <p className="text-sm text-slate-600">Views: {question.views}</p>
        </aside>
      </div>
    </div>
  );
};

export default QuestionDetail;
