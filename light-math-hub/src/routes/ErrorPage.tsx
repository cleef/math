import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div className="fullscreen">
      <div className="state-card">
        <div className="state-title">课程加载失败</div>
        <p>启动课程时遇到异常，请稍后重试。</p>
        <div className="state-actions">
          <Link to="/" className="btn btn-secondary">
            返回数学中心
          </Link>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            重新加载
          </button>
        </div>
      </div>
    </div>
  );
}
