import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="fullscreen">
      <div className="state-card">
        <div className="state-title">页面不存在</div>
        <p>你访问的课程或页面不存在，或链接有误。</p>
        <Link to="/" className="btn btn-secondary">
          返回数学中心
        </Link>
      </div>
    </div>
  );
}
