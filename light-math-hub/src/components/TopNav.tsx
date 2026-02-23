import { FormEvent, KeyboardEvent } from "react";
import { Link } from "react-router-dom";

type UserInfo = {
  name: string;
  role: string;
};

type TopNavProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  user: UserInfo;
};

export default function TopNav({
  query,
  onQueryChange,
  onSearchSubmit,
  user
}: TopNavProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearchSubmit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSearchSubmit();
    }
  };

  return (
    <header className="top-nav">
      <Link to="/" className="top-nav__brand" aria-label="返回数学中心首页">
        <div className="brand-mark" aria-hidden="true">
          MH
        </div>
        <div>
          <div className="brand-title">LIGHT MATH HUB</div>
          <div className="brand-subtitle">Teaching Studio</div>
        </div>
      </Link>
      <form className="top-nav__search" onSubmit={handleSubmit} role="search">
        <input
          type="search"
          placeholder="搜索课程名、知识点或年级"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="搜索数学课程"
        />
        <button type="submit" className="btn btn-secondary">
          搜索
        </button>
      </form>
      <div className="top-nav__user" aria-label="当前用户">
        <div className="user-avatar" aria-hidden="true">
          {user.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="user-name">{user.name}</div>
          <div className="user-role">{user.role}</div>
        </div>
      </div>
    </header>
  );
}
