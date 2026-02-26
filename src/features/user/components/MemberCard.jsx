import { User, Calendar, Activity, Edit2, Trash2 } from "lucide-react";

const MemberCard = ({ member, onEdit, onDelete, loading }) => {
  const getBellySizeColor = (size) => {
    const colors = {
      Small: "bg-green-100 text-green-700 border-green-200",
      Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Large: "bg-red-100 text-red-700 border-red-200",
      "Extra-Large": "bg-purple-100 text-purple-700 border-purple-200",
    };
    return colors[size] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getBellySizeEmoji = (size) => {
    const emojis = {
      Small: "🟢",
      Medium: "🟡",
      Large: "🔴",
      "Extra-Large": "🟣",
    };
    return emojis[size] || "⚪";
  };

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-5 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {member.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
              {member.fullName}
            </h3>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {member.age} years old
            </p>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(member)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            disabled={loading}
            title="Edit member"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(member._id)}
            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
            disabled={loading}
            title="Remove member"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-slate-500" />
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border-2 ${getBellySizeColor(
            member.bellySize,
          )}`}
        >
          <span>{getBellySizeEmoji(member.bellySize)}</span>
          <span className="capitalize">
            {member.bellySize.replace("-", " ")}
          </span>
        </span>
      </div>
    </div>
  );
};

export default MemberCard;
