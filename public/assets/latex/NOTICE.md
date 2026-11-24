# LaTeX resume templates used by AnyJob

AnyJob turns a CV into LaTeX for six open-source templates and compiles it with TeX Live.
Each folder keeps the original licence. Changes made for AnyJob are listed below.

| Template | Source | Licence | Engine | Changes |
|---|---|---|---|---|
| Jake's Resume | https://github.com/jakegut/resume | MIT | pdfLaTeX | Preamble generated in `src/templates.js`; adds `lmodern` so text stays selectable for ATS. |
| Awesome CV | https://github.com/posquit0/Awesome-CV | LPPL 1.3c | XeLaTeX | `awesome/awesomecv-anyjob.cls` (renamed as the LPPL requires): runs on XeLaTeX and loads TeX Live's Source Sans Pro and Roboto by file name. |
| Deedy Resume | https://github.com/deedy/Deedy-Resume | Apache-2.0 | XeLaTeX | `deedy/deedy-resume-anyjob.cls`: loads TeX Live's Lato and Raleway fonts by file name instead of a local fonts folder. |
| ModernCV | https://ctan.org/pkg/moderncv | LPPL 1.3c | pdfLaTeX | None (part of TeX Live). |
| AltaCV | https://github.com/liantze/AltaCV | LPPL 1.3c | pdfLaTeX | None. |
| McDowell CV | https://github.com/dnl-blkv/mcdowell-cv | MIT | XeLaTeX | `mcdowell/mcdowellcv-anyjob.cls`: TeX Gyre Termes instead of Times New Roman, fontspec letter spacing, and `tabularx` instead of the unmaintained `tabu` package. |

Template previews in `/assets/templates/*.jpg` were rendered from a sample CV.
