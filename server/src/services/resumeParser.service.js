import PDFParser from 'pdf2json';

export const parseResumeBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on('pdfParser_dataError', (errData) => {
      reject(new Error(errData.parserError || 'Failed to parse PDF document.'));
    });

    pdfParser.on('pdfParser_dataReady', () => {
      try {
        // Extract raw text representation
        const rawText = pdfParser.getRawTextContent() || '';

        if (!rawText || rawText.trim().length < 50) {
          return reject(
            new Error(
              'Could not extract readable text from the uploaded PDF. Please ensure the document is not an image-only scan.'
            )
          );
        }

        // Clean extra escape sequences
        const cleanedText = decodeURIComponent(rawText)
          .replace(/----------------Page \(\d+\) Break----------------/g, '\n')
          .replace(/\r\n/g, '\n');

        // Baseline technical taxonomy for parsing
        const knownTech = [
          { name: 'JavaScript', category: 'language', regex: /\b(javascript|js|es6)\b/i },
          { name: 'TypeScript', category: 'language', regex: /\b(typescript|ts)\b/i },
          { name: 'Python', category: 'language', regex: /\bpython\b/i },
          { name: 'Java', category: 'language', regex: /\bjava\b(?!script)/i },
          { name: 'C++', category: 'language', regex: /\bc\+\+\b/i },
          { name: 'C', category: 'language', regex: /\b(?<!\w)c(?!\w|\+|\#)/i },
          { name: 'Go', category: 'language', regex: /\b(golang|go)\b/i },
          { name: 'Rust', category: 'language', regex: /\brust\b/i },
          { name: 'SQL', category: 'language', regex: /\bsql\b/i },
          { name: 'React', category: 'framework', regex: /\breact(\.js)?\b/i },
          { name: 'Next.js', category: 'framework', regex: /\bnext(\.js)?\b/i },
          { name: 'Node.js', category: 'framework', regex: /\bnode(\.js)?\b/i },
          { name: 'Express', category: 'framework', regex: /\bexpress(\.js)?\b/i },
          { name: 'Django', category: 'framework', regex: /\bdjango\b/i },
          { name: 'FastAPI', category: 'framework', regex: /\bfastapi\b/i },
          { name: 'Spring Boot', category: 'framework', regex: /\bspring boot\b/i },
          { name: 'MongoDB', category: 'database', regex: /\bmongodb\b/i },
          { name: 'PostgreSQL', category: 'database', regex: /\b(postgresql|postgres)\b/i },
          { name: 'MySQL', category: 'database', regex: /\bmysql\b/i },
          { name: 'Redis', category: 'database', regex: /\bredis\b/i },
          { name: 'Docker', category: 'tool', regex: /\bdocker\b/i },
          { name: 'Kubernetes', category: 'tool', regex: /\b(kubernetes|k8s)\b/i },
          { name: 'AWS', category: 'tool', regex: /\b(aws|amazon web services)\b/i },
          { name: 'Git', category: 'tool', regex: /\bgit(hub|lab)?\b/i },
          { name: 'Linux', category: 'concept', regex: /\blinux\b/i },
          { name: 'REST APIs', category: 'concept', regex: /\brest(ful)? api(s)?\b/i },
          { name: 'GraphQL', category: 'concept', regex: /\bgraphql\b/i },
          { name: 'Tailwind CSS', category: 'framework', regex: /\btailwind( css)?\b/i },
          { name: 'Scikit-learn', category: 'framework', regex: /\bscikit-learn\b/i },
          { name: 'Pandas', category: 'framework', regex: /\bpandas\b/i },
          { name: 'NumPy', category: 'framework', regex: /\bnumpy\b/i },
        ];

        // Identify project context for evidence grading
        const projectSectionMatch = cleanedText.match(
          /(projects?|portfolio|open source contribution)([\s\S]*?)(experience|education|skills|certifications|$)/i
        );
        const projectText = projectSectionMatch ? projectSectionMatch[2] : '';

        const detectedSkills = [];

        for (const item of knownTech) {
          if (item.regex.test(cleanedText)) {
            const isDemonstrated = projectText ? item.regex.test(projectText) : false;
            detectedSkills.push({
              name: item.name,
              category: item.category,
              evidenceLevel: isDemonstrated ? 'demonstrated' : 'mentioned',
              context: isDemonstrated
                ? 'Demonstrated in practical project experience'
                : 'Mentioned in skills or coursework overview',
            });
          }
        }

        // Parse candidate project lines
        const parsedProjects = [];
        const projectLines = projectText.split('\n').filter((l) => l.trim().length > 15);
        for (let i = 0; i < Math.min(projectLines.length, 4); i++) {
          const line = projectLines[i].trim();
          parsedProjects.push({
            title: line.slice(0, 50),
            description: line,
            technologies: detectedSkills
              .filter((s) => s.evidenceLevel === 'demonstrated')
              .map((s) => s.name)
              .slice(0, 5),
          });
        }

        resolve({
          rawText: cleanedText,
          summary: cleanedText.slice(0, 300).replace(/\s+/g, ' ').trim(),
          skills: detectedSkills,
          projects: parsedProjects,
        });
      } catch (err) {
        reject(err);
      }
    });

    // Parse incoming memory buffer
    pdfParser.parseBuffer(buffer);
  });
};