// src/components/icons.tsx
type IconProps = React.SVGProps<SVGSVGElement>;

const svg = (paths: React.ReactNode) =>
  function SvgIcon(props: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {paths}
      </svg>
    );
  };

export const Icon = {
  Dashboard: svg(
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>,
  ),
  Exams: svg(
    <>
      <path d="M4 4h12l4 4v12a2 2 0 0 1-2 2H4z" />
      <path d="M9 12h6M9 16h4" />
    </>,
  ),
  Class: svg(
    <>
      <path d="M17 20a5 5 0 0 0-10 0" />
      <circle cx="12" cy="10" r="4" />
      <path d="M3 20a3 3 0 0 1 4-2.8M21 20a3 3 0 0 0-4-2.8" />
    </>,
  ),
  Students: svg(
    <>
      <path d="M4 19a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4" />
      <circle cx="9" cy="8" r="3" />
      <path d="M15 11a3 3 0 1 0 0-6M20 19a4 4 0 0 0-3-3.8" />
    </>,
  ),
  Book: svg(
    <>
      <path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19a2 2 0 0 0 2 2h12" />
    </>,
  ),
  Layers: svg(
    <>
      <path d="M12 3 3 8l9 5 9-5z" />
      <path d="m3 13 9 5 9-5M3 18l9 5 9-5" />
    </>,
  ),
  Questions: svg(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" />
      <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
    </>,
  ),
  Chart: svg(
    <>
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </>,
  ),
  Timer: svg(
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 2h6" />
    </>,
  ),
  Play: svg(
    <>
      <path d="M7 5v14l12-7z" />
    </>,
  ),
  Certificate: svg(
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="m9 13-1 8 4-2 4 2-1-8" />
    </>,
  ),
  Plus: svg(
    <>
      <path d="M12 5v14M5 12h14" strokeWidth="2" />
    </>,
  ),
  Upload: svg(
    <>
      <path d="M12 3v12M7 8l5-5 5 5" />
      <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
    </>,
  ),
  Filter: svg(
    <>
      <path d="M3 5h18l-7 9v5l-4 2v-7z" />
    </>,
  ),
  Shield: svg(
    <>
      <path d="M12 3 4 6v6c0 4.5 3.2 8.3 8 9 4.8-.7 8-4.5 8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>,
  ),
  Search: svg(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>,
  ),
  // ADICIONADO AQUI: Novo ícone para a página de perfil
  User: svg(
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>,
  ),
};