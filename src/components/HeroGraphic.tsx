import { BRAND } from "@/constants/brand";

const {
  navy,
  primaryBlue,
  skyBlue,
  blueTint,
  slate,
  muted,
  border,
  white,
  logoMark,
} = BRAND;

export default function HeroGraphic() {
  return (
    <div className="hero-graphic-root w-full lg:max-w-none">
      <svg
        viewBox="0 36 680 384"
        width="100%"
        role="img"
        aria-labelledby="hero-graphic-title hero-graphic-desc"
        className="overflow-visible"
      >
        <title id="hero-graphic-title">Sigma Health clinic dashboard preview</title>
        <desc id="hero-graphic-desc">
          Illustration of a clinic dashboard showing patient queue metrics, MOH
          reporting, invoicing, and stock alerts connected to a central app view.
        </desc>

        <defs>
          <filter
            id="hero-glow-blur"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="20" />
          </filter>

          <filter
            id="hero-main-shadow"
            x="-15%"
            y="-15%"
            width="130%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="12"
              floodColor={navy}
              floodOpacity="0.1"
            />
          </filter>

          <filter
            id="hero-sat-shadow"
            x="-20%"
            y="-30%"
            width="140%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="6"
              floodColor={navy}
              floodOpacity="0.08"
            />
          </filter>

          <marker
            id="hero-connector-arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path
              d="M0,0 L6,3 L0,6"
              fill="none"
              stroke="context-stroke"
              strokeWidth="0.8"
            />
          </marker>

          <clipPath id="hero-main-chrome-clip">
            <rect x="138" y="52" width="404" height="40" rx="14" />
          </clipPath>
        </defs>

        {/* Layer 1: glow blobs */}
        <g className="hero-graphic-glows" aria-hidden="true">
          <ellipse
            cx="185"
            cy="270"
            rx="120"
            ry="90"
            fill={primaryBlue}
            opacity="0.08"
            filter="url(#hero-glow-blur)"
          />
          <ellipse
            cx="510"
            cy="170"
            rx="110"
            ry="85"
            fill={skyBlue}
            opacity="0.07"
            filter="url(#hero-glow-blur)"
          />
          <ellipse
            cx="370"
            cy="370"
            rx="130"
            ry="70"
            fill={navy}
            opacity="0.06"
            filter="url(#hero-glow-blur)"
          />
        </g>

        {/* Layer 3 connectors (behind satellites on mobile hide with satellites) */}
        <g
          className="hero-graphic-satellite hero-graphic-sat-connectors"
          aria-hidden="true"
        >
          <path
            d="M122 182 H138"
            fill="none"
            stroke={logoMark}
            strokeWidth="0.8"
            strokeDasharray="3 3"
            markerEnd="url(#hero-connector-arrow)"
          />
          <path
            d="M542 133 H558"
            fill="none"
            stroke={logoMark}
            strokeWidth="0.8"
            strokeDasharray="3 3"
            markerEnd="url(#hero-connector-arrow)"
          />
          <path
            d="M340 324 V362"
            fill="none"
            stroke={logoMark}
            strokeWidth="0.8"
            strokeDasharray="3 3"
            markerEnd="url(#hero-connector-arrow)"
          />
        </g>

        {/* Layer 2: main dashboard card */}
        <g className="hero-graphic-main">
          <rect
            x="138"
            y="52"
            width="404"
            height="272"
            rx="14"
            fill={white}
            stroke={border}
            strokeWidth="0.8"
            filter="url(#hero-main-shadow)"
          />

          <rect
            x="138"
            y="52"
            width="404"
            height="40"
            fill={blueTint}
            clipPath="url(#hero-main-chrome-clip)"
          />
          <rect x="138" y="78" width="404" height="14" fill={blueTint} />

          <circle cx="158" cy="72" r="4.5" fill={logoMark} opacity="0.6" />
          <circle cx="172" cy="72" r="4.5" fill={logoMark} opacity="0.6" />
          <circle cx="186" cy="72" r="4.5" fill={logoMark} opacity="0.6" />

          <rect
            x="248"
            y="62"
            width="184"
            height="20"
            rx="10"
            fill={white}
            stroke={border}
            strokeWidth="0.6"
          />
          <text
            x="340"
            y="75.5"
            textAnchor="middle"
            fontSize="9"
            fill={muted}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            app.sigmahmis.com
          </text>

          <text
            x="158"
            y="108"
            fontSize="11"
            fontWeight="500"
            fill={slate}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Sunrise Community Clinic
          </text>
          <text
            x="158"
            y="122"
            fontSize="10"
            fill={muted}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Nairobi, Kenya · Today
          </text>

          <line
            x1="158"
            y1="132"
            x2="522"
            y2="132"
            stroke={border}
            strokeWidth="0.5"
          />

          {/* Metric pills */}
          <g fontFamily="ui-sans-serif, system-ui, sans-serif">
            <rect x="158" y="142" width="86" height="38" rx="8" fill={navy} />
            <text x="168" y="156" fontSize="8" fill={logoMark}>
              Patients today
            </text>
            <text x="168" y="172" fontSize="13" fontWeight="600" fill={white}>
              47
            </text>

            <rect x="252" y="142" width="86" height="38" rx="8" fill={primaryBlue} />
            <text x="262" y="156" fontSize="8" fill={blueTint}>
              Revenue
            </text>
            <text x="262" y="172" fontSize="13" fontWeight="600" fill={white}>
              K284k
            </text>

            <rect
              x="346"
              y="142"
              width="86"
              height="38"
              rx="8"
              fill={blueTint}
              stroke={border}
              strokeWidth="0.6"
            />
            <text x="356" y="156" fontSize="8" fill={primaryBlue}>
              Low-stock alerts
            </text>
            <text x="356" y="172" fontSize="13" fontWeight="600" fill={primaryBlue}>
              3
            </text>

            <rect x="440" y="142" width="82" height="38" rx="8" fill={slate} />
            <text x="450" y="156" fontSize="8" fill={logoMark}>
              Queue
            </text>
            <text x="450" y="172" fontSize="13" fontWeight="600" fill={white}>
              6
            </text>
          </g>

          <line
            x1="158"
            y1="192"
            x2="522"
            y2="192"
            stroke={border}
            strokeWidth="0.5"
          />

          {/* Patient rows */}
          <g fontFamily="ui-sans-serif, system-ui, sans-serif">
            <circle cx="168" cy="214" r="10" fill={primaryBlue} />
            <text
              x="168"
              y="217.5"
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fill={white}
            >
              GW
            </text>
            <text x="186" y="211" fontSize="10" fontWeight="500" fill={navy}>
              Grace Wanjiku
            </text>
            <text x="186" y="223" fontSize="9" fill={muted}>
              Antenatal check-up
            </text>
            <rect x="448" y="202" width="74" height="18" rx="8" fill={primaryBlue} />
            <text
              x="485"
              y="214"
              textAnchor="middle"
              fontSize="8"
              fontWeight="500"
              fill={white}
            >
              In consult
            </text>

            <circle cx="168" cy="248" r="10" fill={skyBlue} />
            <text
              x="168"
              y="251.5"
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fill={white}
            >
              AO
            </text>
            <text x="186" y="245" fontSize="10" fontWeight="500" fill={navy}>
              Amina Okafor
            </text>
            <text x="186" y="257" fontSize="9" fill={muted}>
              Fever and cough
            </text>
            <rect
              x="452"
              y="236"
              width="70"
              height="18"
              rx="8"
              fill={blueTint}
              stroke={border}
              strokeWidth="0.6"
            />
            <text
              x="487"
              y="248"
              textAnchor="middle"
              fontSize="8"
              fontWeight="500"
              fill={primaryBlue}
            >
              Waiting
            </text>

            <circle cx="168" cy="282" r="10" fill={slate} />
            <text
              x="168"
              y="285.5"
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fill={white}
            >
              RM
            </text>
            <text x="186" y="279" fontSize="10" fontWeight="500" fill={navy}>
              Rajesh Mehta
            </text>
            <text x="186" y="291" fontSize="9" fill={muted}>
              Diabetes follow-up
            </text>
            <rect x="464" y="270" width="58" height="18" rx="8" fill={border} />
            <text
              x="493"
              y="282"
              textAnchor="middle"
              fontSize="8"
              fontWeight="500"
              fill={slate}
            >
              Done
            </text>
          </g>
        </g>

        {/* Left satellite — MOH report */}
        <g className="hero-graphic-satellite hero-graphic-sat-left">
          <rect
            x="14"
            y="148"
            width="108"
            height="76"
            rx="10"
            fill={white}
            stroke={border}
            strokeWidth="0.8"
            filter="url(#hero-sat-shadow)"
          />
          <text
            x="26"
            y="168"
            fontSize="10"
            fontWeight="500"
            fill={navy}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            MOH report
          </text>
          <text
            x="26"
            y="181"
            fontSize="8"
            fill={muted}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Auto-generated
          </text>
          <rect x="26" y="190" width="10" height="22" rx="2" fill={primaryBlue} opacity="0.45" />
          <rect x="40" y="198" width="10" height="14" rx="2" fill={primaryBlue} opacity="0.6" />
          <rect x="54" y="186" width="10" height="26" rx="2" fill={primaryBlue} opacity="0.72" />
          <rect x="68" y="192" width="10" height="20" rx="2" fill={primaryBlue} opacity="0.8" />
        </g>

        {/* Right satellite — Invoice */}
        <g className="hero-graphic-satellite hero-graphic-sat-right">
          <rect
            x="558"
            y="94"
            width="112"
            height="78"
            rx="10"
            fill={white}
            stroke={border}
            strokeWidth="0.8"
            filter="url(#hero-sat-shadow)"
          />
          <text
            x="570"
            y="114"
            fontSize="10"
            fontWeight="500"
            fill={navy}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Invoice #2847
          </text>
          <text
            x="570"
            y="127"
            fontSize="8"
            fill={muted}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Auto-generated
          </text>
          <line x1="570" y1="134" x2="658" y2="134" stroke={border} strokeWidth="0.5" />
          <text
            x="658"
            y="148"
            textAnchor="end"
            fontSize="8"
            fill={navy}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Consultation · K12,000
          </text>
          <text
            x="658"
            y="160"
            textAnchor="end"
            fontSize="8"
            fill={navy}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Pharmacy · K4,500
          </text>
          <text
            x="658"
            y="176"
            textAnchor="end"
            fontSize="8"
            fontWeight="500"
            fill={primaryBlue}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Total · K16,500
          </text>
        </g>

        {/* Bottom satellite — Stock alert */}
        <g className="hero-graphic-satellite hero-graphic-sat-bottom">
          <rect
            x="218"
            y="362"
            width="244"
            height="46"
            rx="10"
            fill={navy}
            stroke={slate}
            strokeWidth="0.8"
          />
          <circle cx="234" cy="385" r="4" fill={skyBlue} />
          <text
            x="246"
            y="382"
            fontSize="10"
            fontWeight="500"
            fill={white}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Low stock: Amoxicillin
          </text>
          <text
            x="246"
            y="396"
            fontSize="8"
            fill={logoMark}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            Reorder level reached · 8 units left
          </text>
        </g>
      </svg>
    </div>
  );
}
