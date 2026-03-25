import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      /* ======================
       * Fonts
       * ====================== */
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },

      fontSize: {
        // body
        paragraph: ["13px", { lineHeight: "20px" }],
        hint: ["12px", { lineHeight: "16px" }],

        // titles (use font-semibold in components)
        title1: ["32px", { lineHeight: "40px" }],
        title2: ["22px", { lineHeight: "28px" }],
        title3: ["18px", { lineHeight: "24px" }],
        title4: ["13px", { lineHeight: "20px" }],

        // code
        code: ["13px", { lineHeight: "20px" }],
      },

      /* ======================
       * Spacing
       * ====================== */
      spacing: {
        0: "0px",
        xs: "4px",
        sm: "8px",
        mid: "12px",
        md: "16px",
        lg: "24px",
      },

      /* ======================
       * Border Radius
       * ====================== */
      borderRadius: {
        0: "0px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        full: "999px",
      },

      /* ======================
       * Primitive Colors
       * ====================== */
      colors: {
        /* ======================
         * Semantic tokens (example: Background)
         * ====================== */
        background: {
          primary: "var(--background-primary)",
          secondary: "var(--background-secondary)",
          tertiary: "var(--background-tertiary)",
          shell: "var(--background-shell)",
          warning: "var(--background-warning)",
          danger: "var(--background-danger)",
          success: "var(--background-success)",
        },

        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          placeholder: "var(--text-placeholder)",
          validation: {
            danger: "var(--text-validation-danger)",
            warning: "var(--text-validation-warning)",
            success: "var(--text-validation-success)",
          },
        },

        action: {
          link: {
            default: "var(--action-link-default)",
            hover: "var(--action-link-hover)",
            press: "var(--action-link-press)",
          },
          primary: {
            text: {
              default: "var(--action-primary-text-default)",
              hover: "var(--action-primary-text-hover)",
              press: "var(--action-primary-text-press)",
            },
            icon: "var(--action-primary-icon)",
            background: {
              default: "var(--action-primary-background-default)",
              hover: "var(--action-primary-background-hover)",
              press: "var(--action-primary-background-press)",
            },
          },
          default: {
            text: {
              default: "var(--action-default-text-default)",
              hover: "var(--action-default-text-hover)",
              press: "var(--action-default-text-press)",
            },
            icon: {
              default: "var(--action-default-icon-default)",
              hover: "var(--action-default-icon-hover)",
              press: "var(--action-default-icon-press)",
            },
            background: {
              default: "var(--action-default-background-default)",
              hover: "var(--action-default-background-hover)",
              press: "var(--action-default-background-press)",
            },
            border: {
              default: "var(--action-default-border-default)",
              hover: "var(--action-default-border-hover)",
              focus: "var(--action-default-border-focus)",
              press: "var(--action-default-border-press)",
            },
          },
          icon: {
            background: {
              default: "var(--action-icon-background-default)",
              hover: "var(--action-icon-background-hover)",
              press: "var(--action-icon-background-press)",
            },
            icon: {
              default: "var(--action-icon-icon-default)",
              hover: "var(--action-icon-icon-hover)",
              press: "var(--action-icon-icon-press)",
            },
          },
          tertiary: {
            background: {
              default: "var(--action-tertiary-background-default)",
              hover: "var(--action-tertiary-background-hover)",
              press: "var(--action-tertiary-background-press)",
            },
            text: {
              default: "var(--action-tertiary-text-default)",
              hover: "var(--action-tertiary-text-hover)",
              press: "var(--action-tertiary-text-press)",
            },
            icon: {
              default: "var(--action-tertiary-icon-default)",
              hover: "var(--action-tertiary-icon-hover)",
              press: "var(--action-tertiary-icon-press)",
            },
          },
          danger: {
            default: {
              text: {
                default: "var(--action-danger-default-text-default)",
                hover: "var(--action-danger-default-text-hover)",
                press: "var(--action-danger-default-text-press)",
              },
              background: {
                default: "var(--action-danger-default-background-default)",
                hover: "var(--action-danger-default-background-hover)",
                press: "var(--action-danger-default-background-press)",
              },
              border: {
                default: "var(--action-danger-default-border-default)",
                hover: "var(--action-danger-default-border-hover)",
                press: "var(--action-danger-default-border-press)",
              },
            },
            primary: {
              background: {
                default: "var(--action-danger-primary-background-default)",
                hover: "var(--action-danger-primary-background-hover)",
                press: "var(--action-danger-primary-background-press)",
              },
              text: "var(--action-danger-primary-text)",
            },
          },

          disabled: {
            text: "var(--action-disabled-text)",
            background: "var(--action-disabled-background)",
            border: "var(--action-disabled-border)",
          },
        },

        /* ======================
         * Brand (primitive)
         * ====================== */
        brand: {
          blue: "var(--brand-blue)",
          yellow: "var(--brand-yellow)",
          red: "var(--brand-red)",
        },

        /* ======================
         * Signals (semantic)
         * ====================== */
        signal: {
          icon: {
            certified: "var(--signal-icon-certified)",
            favorited: "var(--signal-icon-favorited)",
            trending: "var(--signal-icon-trending)",
            shared: "var(--signal-icon-shared)",
            pinned: "var(--signal-icon-pinned)",
          },
        },

        border: "var(--border)",
        "border-accessible": "var(--border-accessible)",
        "border-danger": "var(--border-danger)",
        "border-warning": "var(--border-warning)",
        "border-success": "var(--border-success)",
        skeleton: "var(--skeleton)",

        overlay: {
          overlay: "var(--overlay-overlay)",
        },

        tooltip: {
          background: "var(--tooltip-background)",
        },

        code: {
          background: "var(--code-background)",
        },

        tag: {
          inverse: "var(--tag-inverse)",
          hover: "var(--tag-hover)",
          press: "var(--tag-press)",
          icon: {
            hover: "var(--tag-icon-hover)",
            press: "var(--tag-icon-press)",
          },
          text: {
            default: "var(--tag-text-default)",
            charcoal: "var(--tag-text-charcoal)",
            lemon: "var(--tag-text-lemon)",
            lime: "var(--tag-text-lime)",
            teal: "var(--tag-text-teal)",
            turquoise: "var(--tag-text-turquoise)",
            indigo: "var(--tag-text-indigo)",
            purple: "var(--tag-text-purple)",
            pink: "var(--tag-text-pink)",
            coral: "var(--tag-text-coral)",
            brown: "var(--tag-text-brown)",
          },
          iconColor: {
            default: "var(--tag-icon-default)",
            charcoal: "var(--tag-icon-charcoal)",
            lemon: "var(--tag-icon-lemon)",
            lime: "var(--tag-icon-lime)",
            teal: "var(--tag-icon-teal)",
            turquoise: "var(--tag-icon-turquoise)",
            indigo: "var(--tag-icon-indigo)",
            purple: "var(--tag-icon-purple)",
            pink: "var(--tag-icon-pink)",
            coral: "var(--tag-icon-coral)",
            brown: "var(--tag-icon-brown)",
          },
          background: {
            default: "var(--tag-background-default)",
            charcoal: "var(--tag-background-charcoal)",
            lemon: "var(--tag-background-lemon)",
            lime: "var(--tag-background-lime)",
            teal: "var(--tag-background-teal)",
            turquoise: "var(--tag-background-turquoise)",
            indigo: "var(--tag-background-indigo)",
            purple: "var(--tag-background-purple)",
            pink: "var(--tag-background-pink)",
            coral: "var(--tag-background-coral)",
            brown: "var(--tag-background-brown)",
          },
        },

        table: {
          background: {
            unselected: {
              default: "var(--table-background-unselected-default)",
              alt: "var(--table-background-unselected-alt)",
            },
            selected: {
              8: "var(--table-background-selected-8)",
              12: "var(--table-background-selected-12)",
            },
          },
        },

        progress: {
          fill: "var(--progress-fill)",
          track: "var(--progress-track)",
          fillPrimary: "var(--progress-fill-primary)",
        },

        white: "#FFFFFF",

        neutral: {
          50: "#F7F7F7",
          100: "#EBEBEB",
          200: "#D8D8D8",
          300: "#CBCBCB",
          350: "#A2A2A2",
          400: "#939393",
          500: "#6F6F6F",
          600: "#525252",
          650: "#424242",
          700: "#262626",
          800: "#161616",
        },

        grey: {
          50: "#F6F7F9",
          100: "#E8ECF0",
          200: "#D1D9E1",
          300: "#C0CDD8",
          350: "#92A4B3",
          400: "#8396A5",
          500: "#5F7281",
          600: "#445461",
          650: "#37444F",
          700: "#1F272D",
          750: "#161C22",
          800: "#11171C",
        },

        blue: {
          100: "#F0F8FF",
          200: "#D7EDFE",
          300: "#BAE1FC",
          400: "#8ACAFF",
          500: "#4299E0",
          600: "#2272B4",
          700: "#0E538B",
          800: "#04355D",
        },

        red: {
          100: "#FFF5F7",
          200: "#FDE2E8",
          300: "#FBD0D8",
          400: "#F792A6",
          500: "#E65B77",
          600: "#C82D4C",
          700: "#9E102C",
          800: "#630316",
        },

        green: {
          100: "#F3FCF6",
          200: "#D4F7DF",
          300: "#B1ECC5",
          400: "#8DDDA8",
          500: "#3BA65E",
          600: "#277C43",
          700: "#115026",
          800: "#093919",
        },

        yellow: {
          100: "#FFF9EB",
          200: "#FCEACA",
          300: "#F8D4A5",
          400: "#F2BE88",
          500: "#DE7921",
          600: "#BE501E",
          700: "#93320B",
          800: "#5F1B02",
        },

        // single-value accents
        lemon: "#FACB66",
        lime: "#308613",
        teal: "#04867D",
        turquoise: "#137DAE",
        indigo: "#434A93",
        purple: "#8A63BF",
        pink: "#B45091",
        coral: "#C83243",

      },
    },
  },
  plugins: [],
};

export default config;

