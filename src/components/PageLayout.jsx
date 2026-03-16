import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Consistent page wrapper matching user-app patterns.
 *
 * Pattern 1 (default): Gradient background + dark header text (detail/secondary screens)
 * Pattern 2 (green):   Green sticky header bar (main feature screens like Profile)
 *
 * @param {string}  title        - Page title
 * @param {string}  subtitle     - Optional subtitle below title
 * @param {string}  backTo       - Navigate to this path on back (default: go back)
 * @param {boolean} green        - Use green header pattern
 * @param {React.ReactNode} headerRight - Optional right-side action in header
 * @param {React.ReactNode} children    - Page content
 * @param {string}  maxWidth     - Max width class (default: "max-w-2xl")
 */
const PageLayout = ({
  title,
  subtitle,
  backTo,
  green = false,
  headerRight,
  children,
  maxWidth = "max-w-2xl",
}) => {
  const navigate = useNavigate();
  const goBack = () => (backTo ? navigate(backTo) : navigate(-1));

  if (green) {
    return (
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div
          className="sticky top-0 z-40 bg-brand px-4 py-3.5"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.875rem)" }}
        >
          <div className={`flex items-center ${maxWidth} mx-auto`}>
            <button onClick={goBack} className="p-1 -ml-1 mr-3 text-white">
              <ArrowLeft className="w-5.5 h-5.5" />
            </button>
            <h1 className="flex-1 text-[22px] font-black text-white">
              {title}
            </h1>
            {headerRight}
          </div>
        </div>
        <div className={`${maxWidth} mx-auto px-4 py-6`}>{children}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4">
      <div className={`${maxWidth} mx-auto`}>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goBack}
            className="p-2 rounded-xl hover:bg-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-slate-900">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {headerRight}
        </div>
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
