import { Link } from "react-router-dom";

export default function AccessDeniedPage() {
  return (
    <div className="fullscreen">
      <div className="state-card">
        <div className="state-title">访问受限</div>
        <p>你当前没有该课程应用的访问权限。</p>
        <Link to="/" className="btn btn-secondary">
          返回数学中心
        </Link>
      </div>
    </div>
  );
}
