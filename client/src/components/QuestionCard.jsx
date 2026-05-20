import { Link } from 'react-router-dom';

const QuestionCard = ({ question }) => {
  const questionId = question.id || question._id;

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
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600 transition group-hover:bg-slate-200">
            View question
          </span>
        </div>
      </div>
    </Link>
  );
};

export default QuestionCard;
