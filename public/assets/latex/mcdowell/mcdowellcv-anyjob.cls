%% The MIT License (MIT)
%%
%% Copyright (c) 2015 Daniil Belyakov
%%
%% Permission is hereby granted, free of charge, to any person obtaining a copy
%% of this software and associated documentation files (the "Software"), to deal
%% in the Software without restriction, including without limitation the rights
%% to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
%% copies of the Software, and to permit persons to whom the Software is
%% furnished to do so, subject to the following conditions:
%%
%% The above copyright notice and this permission notice shall be included in all
%% copies or substantial portions of the Software.
%%
%% THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
%% IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
%% FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
%% AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
%% LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
%% OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
%% SOFTWARE.

% Modified copy of mcdowellcv.cls for AnyJob: uses TeX Gyre Termes (a Times clone shipped
% with TeX Live) instead of the system font Times New Roman, so it compiles on Linux servers,
% spaces the name with fontspec's LetterSpace (microtype letterspacing needs LuaTeX), and uses
% tabularx instead of the unmaintained tabu package, which no longer works with current LaTeX.
\ProvidesClass{mcdowellcv-anyjob}[2022/03/18 v1.2.0 McDowell CV class]

% Set up the fonts according to options
\def\mainfontsize{11pt}
\def\mainfontface{Times New Roman}

\DeclareOption{calibri}{%
  \def\mainfontface{Calibri}
}

% Set up papersize according to options, default to US letter
\def\papersize{letterpaper}
%Set up bool for adjusting vspacing later
\newif\ifpapersize

\DeclareOption{a4paper}{%
  \def\papersize{a4paper}
  \papersizetrue
}

\DeclareOption{letterpaper}{%
  \def\papersize{letterpaper}
  \papersizefalse
}
\ProcessOptions\relax

% Set font size and paper type
\LoadClass[\papersize,\mainfontsize]{article}

% Set document margins
\usepackage[left=0.75in,top=0.6in,right=0.75in,bottom=0.6in]{geometry}

% Set font face
\usepackage{fontspec}
\setmainfont{texgyretermes}[Extension=.otf, UprightFont=*-regular, BoldFont=*-bold, ItalicFont=*-italic, BoldItalicFont=*-bolditalic,
Ligatures={TeX, NoCommon, NoDiscretionary}]

% Remove paragraph indentation
\usepackage[parfill]{parskip}

% Required for boldface (\bf and \bfseries) tabular columns
\usepackage{array}

% Required for ifthenelse statements
\usepackage{etoolbox}

% Suppress page numbers
\pagestyle{empty}

% Flexible tables
\usepackage{tabularx}

% For custom margins
\usepackage{changepage}

% To customize lists
\usepackage{enumitem}
% Remove left margin from lists, suppress vertical item separation and set top
% separation to a negative value to suppress a single parskip before lists
\setlist{leftmargin=*, noitemsep, topsep=-1\parskip}

% For adjusting spacing based on the platform used
\usepackage{ifthen}
\usepackage{ifplatform}

% For spcaed small caps
\usepackage{microtype}

\DeclareMicrotypeSet*{smallcapsi} {
  encoding = {OT1,T1,T2A,LY1,OT4,QX,T5,TS1,EU1,EU2},
  shape = {sc*,si,scit}
}

%--------------------------------------------------------------------------------
%                                   Constants                                   -
%--------------------------------------------------------------------------------

\ifthenelse{\equal{\platformname}{\notwindowsname}}{
  \def\namespaceskip{0.575em}
  \def\afterheaderspace{1.1pt}
  \def\beforesectionheaderspace{5pt}
  \def\sectionheadermargin{6pt}
  \def\beforesectionheaderhrulespace{2.85pt}
  \def\sectionheaderhrlueheight{0.518pt}
  \def\aftersectionheaderspace{-5.8pt}
  
  \ifpapersize
    \def\aftersinglelinesubsectionheaderspace{-5.75pt}
  \else
    \def\aftersinglelinesubsectionheaderspace{-20.25pt}
  \fi
  
  \def\afterdoublelinesubsectionheaderspace{-11.75pt}
  \def\aftermultilinesubsectionheaderspace{-7.75pt}
  \def\afteremptysubsectionheaderspace{1.25pt}
  \def\subsectionmargin{9pt}
  \def\aftersubsectionspace{2.1pt}
}{
  \def\namespaceskip{0.4em}
  \def\afterheaderspace{3pt}
  \def\beforesectionheaderspace{4.75pt}
  \def\sectionheadermargin{6pt}
  \def\beforesectionheaderhrulespace{3pt}
  \def\sectionheaderhrlueheight{0.5pt}
  \def\aftersectionheaderspace{-4pt}
  
  \ifpapersize
    \def\aftersinglelinesubsectionheaderspace{-4pt}
  \else
    \def\aftersinglelinesubsectionheaderspace{-18.5pt}
  \fi

  \def\afterdoublelinesubsectionheaderspace{-10pt}
  \def\aftermultilinesubsectionheaderspace{-6pt}
  \def\afteremptysubsectionheaderspace{3pt}
  \def\subsectionmargin{9pt}
  \def\aftersubsectionspace{4pt}
}

%--------------------------------------------------------------------------------
%                            Header Setup and Printing                          -
%--------------------------------------------------------------------------------

% Address
\makeatletter

\newcommand\address[1]{\def\@address{#1}}
\address{}

\newcommand\printaddress{
  \small{\@address}
}

\makeatother

% Name
\makeatletter

\newcommand\name[1]{\def\@name{#1}}
\name{}

\newcommand\printname{
  \typeout {kokoko}
  \typeout \spaceskip
  \spaceskip \namespaceskip \relax
  \textbf{\LARGE{\addfontfeature{LetterSpace=11}\textsc{\@name}}}
}

\makeatother

% Contacts
\makeatletter

\newcommand\contacts[1]{\def\@contacts{#1}}
\contacts{}

\newcommand\printcontacts{
  \small{\@contacts}
}

\makeatother

\makeatletter
\newcommand\makeheader{
  \begin{center}
    \begin{tabularx}{\textwidth}{@{}>{\raggedright\arraybackslash}m{0.24\textwidth}>{\centering\arraybackslash}X>{\raggedleft\arraybackslash}m{0.24\textwidth}@{}}
      \printaddress & \printname & \printcontacts \\
    \end{tabularx}
  \end{center}
  \vspace*{\afterheaderspace}
}
\makeatother

%--------------------------------------------------------------------------------
%                            Sections and Subsections                           -
%--------------------------------------------------------------------------------

% AnyJob: spacing tuned for tabularx (the original values were tuned for tabu).
\def\aftersinglelinesubsectionheaderspace{-15pt}
\def\afterdoublelinesubsectionheaderspace{-15pt}
\def\aftermultilinesubsectionheaderspace{-15pt}

% Print a section header
\makeatletter
\newenvironment{cvsection}[1]{
  \vspace*{\beforesectionheaderspace}
  % Set text margins to equal \tabcolsep (6pt by default)
  \begin{adjustwidth}{\sectionheadermargin}{\sectionheadermargin}
    \textsc{\textbf{#1}}
  \end{adjustwidth}
  \vspace*{\beforesectionheaderhrulespace}
  \hrule height \sectionheaderhrlueheight
  \vspace*{\aftersectionheaderspace}
}{}
\makeatother

% Print a subsection
\makeatletter
% Define toggles checking if titles were defined
\newtoggle{lefttitledefined}
\newtoggle{centertitledefined}
\newtoggle{righttitledefined}

\newenvironment{cvsubsection}[4][1]{
  \notblank{#2}{\toggletrue{lefttitledefined}}{}
  \notblank{#3}{\toggletrue{centertitledefined}}{}
  \notblank{#4}{\toggletrue{righttitledefined}}{}
  \ifboolexpr{togl {lefttitledefined} or togl {centertitledefined} or togl {righttitledefined}}{
    \begin{tabularx}{\textwidth}{@{}>{\raggedright\arraybackslash}X>{\centering\arraybackslash}X>{\raggedleft\arraybackslash}X@{}}
      \textbf{#2} & \textbf{#3} & \textbf{#4} \\
    \end{tabularx}
    % Add space according to the specidied number of lines
    \ifnumcomp{#1}{=}{1}{\vspace*{\aftersinglelinesubsectionheaderspace}}{
      \ifnumcomp{#1}{=}{2}{\vspace*{\afterdoublelinesubsectionheaderspace}}{
        \vspace*{\aftermultilinesubsectionheaderspace}
      }
    }
  }{
    \vspace*{\afteremptysubsectionheaderspace}
  }
  \togglefalse{lefttitledefined}
  \togglefalse{centertitledefined}
  \togglefalse{righttitledefined}
  \begin{adjustwidth}{\subsectionmargin}{\subsectionmargin}
}
{
  \end{adjustwidth}
  \vspace*{\aftersubsectionspace}
}
\makeatother
