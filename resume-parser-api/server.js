const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: '*',
  })
);

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TalentFlow Resume Parser API is running',
  });
});

app.post('/resume/parse', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file.',
      });
    }

    const fileName = req.file.originalname || '';
    const fileType = req.file.mimetype || '';

    let resumeText = '';

    if (
      fileType === 'application/pdf' ||
      fileName.toLowerCase().endsWith('.pdf')
    ) {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text || '';
    } else if (
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.toLowerCase().endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({
        buffer: req.file.buffer,
      });

      resumeText = result.value || '';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Only PDF and DOCX resumes are supported.',
      });
    }

    resumeText = resumeText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract readable text from this resume.',
      });
    }

    const candidate = extractCandidateDetails(resumeText);

    return res.json({
      success: true,
      fileName,
      candidate,
      rawText: resumeText,
    });
  } catch (error) {
    console.error('Resume parsing error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to process the resume.',
    });
  }
});

function extractCandidateDetails(text) {
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  const email = extractEmail(normalizedText);
  const phone = extractPhone(normalizedText);

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const name = extractName(lines);
  const position = extractPosition(normalizedText);
  const experience = extractExperience(normalizedText);
  const location = extractLocation(text);
  const linkedin = extractLinkedIn(text);
  const portfolio = extractPortfolio(text);
  const skills = extractSkills(text);
  const education = extractEducation(text);
  const notes = extractNotes(text);

  return {
    name,
    email,
    phone,
    position,
    experience,
    location,
    status: 'Applied',
    skills,
    education,
    linkedin,
    portfolio,
    notes,
  };
}

function extractEmail(text) {
  const emailMatch = text.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  );

  return emailMatch ? emailMatch[0].trim() : '';
}

function extractPhone(text) {
  const phonePatterns = [
    /(?:\+91[\s-]?)?[6-9]\d{9}\b/,
    /\+91[\s-]?\d{5}[\s-]?\d{5}/,
    /\+91[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}/,
  ];

  for (const pattern of phonePatterns) {
    const match = text.match(pattern);

    if (match) {
      return match[0].trim();
    }
  }

  return '';
}

function extractName(lines) {
  for (const line of lines.slice(0, 10)) {
    const cleanLine = line.replace(/\s+/g, ' ').trim();

    if (
      cleanLine.length >= 3 &&
      cleanLine.length <= 60 &&
      !cleanLine.includes('@') &&
      !/\d/.test(cleanLine) &&
      !/resume|curriculum vitae|cv|profile|objective/i.test(cleanLine)
    ) {
      const words = cleanLine.split(' ');

      if (
        words.length >= 2 &&
        words.length <= 5 &&
        words.every((word) => /^[A-Za-z.'-]+$/.test(word))
      ) {
        return cleanLine;
      }
    }
  }

  return '';
}

function extractExperience(text) {
  const experiencePatterns = [
    /(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i,
    /experience\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/i,
    /(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/i,
  ];

  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);

    if (match) {
      return `${match[1]} years`;
    }
  }

  return '';
}

function extractPosition(text) {
  const positions = [
    'Frontend Developer',
    'Angular Developer',
    'Web Developer',
    'Software Developer',
    'Full Stack Developer',
    'UI/UX Designer',
    'UI UX Designer',
    'Web Designer',
    'Software Engineer',
    'React Developer',
    'Backend Developer',
    'PHP Developer',
    'WordPress Developer',
    'UI Designer',
    'UX Designer',
  ];

  for (const position of positions) {
    const regex = new RegExp(
      position.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i'
    );

    if (regex.test(text)) {
      return position;
    }
  }

  return '';
}

function extractLocation(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const locationMatch = line.match(
      /^(?:current\s+)?location\s*[:\-]\s*(.+)$/i
    );

    if (locationMatch) {
      return cleanContactValue(locationMatch[1]);
    }
  }

  for (const line of lines.slice(0, 12)) {
    if (line.includes('@') && line.includes('|')) {
      const parts = line
        .split('|')
        .map((part) => part.trim())
        .filter(Boolean);

      for (const part of parts) {
        if (
          !part.includes('@') &&
          !/\+?\d[\d\s-]{7,}/.test(part) &&
          /[A-Za-z]/.test(part) &&
          /,/.test(part)
        ) {
          return cleanContactValue(part);
        }
      }
    }
  }

  const locationPatterns = [
    /([A-Za-z .'-]+,\s*[A-Za-z .'-]+,\s*(?:India|USA|UK|UAE))/i,
    /([A-Za-z .'-]+,\s*(?:Delhi|Mumbai|Bangalore|Bengaluru|Pune|Noida|Gurgaon|Gurugram|Faridabad|Hyderabad|Chennai|Kolkata|Jaipur|Ahmedabad))/i,
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);

    if (match) {
      return cleanContactValue(match[1]);
    }
  }

  return '';
}

function extractLinkedIn(text) {
  const labeledMatch = text.match(
    /linkedin\s*[:\-]?\s*(?:https?:\/\/)?(?:www\.)?(linkedin\.com\/in\/[A-Za-z0-9._-]+)/i
  );

  if (labeledMatch) {
    return `https://${labeledMatch[1]}`;
  }

  const directMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?(linkedin\.com\/in\/[A-Za-z0-9._-]+)/i
  );

  if (directMatch) {
    return `https://${directMatch[1]}`;
  }

  return '';
}

function extractPortfolio(text) {
  const portfolioMatch = text.match(
    /portfolio\s*[:\-]?\s*((?:https?:\/\/)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?:\/[^\s|]+)?)/i
  );

  if (portfolioMatch) {
    let value = portfolioMatch[1].trim();

    if (!/^https?:\/\//i.test(value)) {
      value = `https://${value}`;
    }

    return value;
  }

  const websiteMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9-]+\.(?:com|in|org|net|io|dev|me)(?:\/[^\s|]*)?/i
  );

  if (websiteMatch) {
    const value = websiteMatch[0];

    if (
      !/linkedin\.com/i.test(value) &&
      !/@/.test(value)
    ) {
      if (!/^https?:\/\//i.test(value)) {
        return `https://${value}`;
      }

      return value;
    }
  }

  return '';
}

function extractSkills(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const skillLines = [];
  let insideSkillsSection = false;

  for (const line of lines) {
    const normalizedLine = line
      .replace(/^[#*\s]+/, '')
      .trim();

    // Start Technical Skills section.
    if (
      /^(technical skills|skills|core skills|key skills|skills & expertise)\s*:?\s*$/i.test(
        normalizedLine
      )
    ) {
      insideSkillsSection = true;
      continue;
    }

    // Stop when another major resume section begins.
    if (
      insideSkillsSection &&
      /^(professional experience|professional\s+experience\s*:|experience|work experience|projects|education|certifications|additional information|interests|ai[-\s]?assisted\s+workflow)\b/i.test(
        normalizedLine
      )
    ) {
      break;
    }

    if (insideSkillsSection) {
      skillLines.push(normalizedLine);
    }
  }

  if (skillLines.length > 0) {
    return skillLines
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return '';
}

function extractEducation(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const educationLines = [];
  let insideEducationSection = false;

  for (const line of lines) {
    if (
      /^(education|academic background|educational qualification)\s*:?\s*$/i.test(
        line
      )
    ) {
      insideEducationSection = true;
      continue;
    }

    if (
      insideEducationSection &&
      /^(additional information|achievements|certifications|interests|references)\b/i.test(
        line
      )
    ) {
      break;
    }

    if (insideEducationSection) {
      educationLines.push(line);
    }
  }

  if (educationLines.length > 0) {
    return educationLines
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const educationMatches = text.match(
    /(?:B\.?Tech|B\.?E\.?|Bachelor(?:'s)?|Master(?:'s)?|M\.?Tech|M\.?E\.?|Diploma|BCA|MCA)[^\n]*/gi
  );

  if (educationMatches) {
    return educationMatches
      .join(' | ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return '';
}

function extractNotes(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let insideSummary = false;
  const summaryLines = [];

  for (const line of lines) {
    if (
      /^(professional summary|summary|profile|career summary|objective)\s*:?\s*$/i.test(
        line
      )
    ) {
      insideSummary = true;
      continue;
    }

    if (
      insideSummary &&
      /^(technical skills|skills|professional experience|experience|projects|education|additional information|ai[-\s]?assisted\s+workflow)\b/i.test(
        line
      )
    ) {
      break;
    }

    if (insideSummary) {
      summaryLines.push(line);
    }
  }

  if (summaryLines.length > 0) {
    return summaryLines
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return '';
}

function cleanContactValue(value) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/[|]+$/g, '')
    .trim();
}

app.listen(PORT, () => {
  console.log(
    `TalentFlow Resume Parser API running on port ${PORT}`
  );
});