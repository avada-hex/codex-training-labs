const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { summarizeText } = require('./summary');

const PORT = process.env.PORT || 4001;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const createStage = (stage, status, details, metrics = {}) => ({
  stage,
  status,
  details,
  metrics,
  timestamp: new Date().toISOString()
});

app.post('/api/summarize', upload.single('document'), (req, res) => {
  try {
    const fileText = req.file && req.file.buffer ? req.file.buffer.toString('utf-8') : '';
    const bodyText = req.body?.text ? String(req.body.text) : '';
    const pieces = [fileText, bodyText].map((piece) => piece.trim()).filter(Boolean);

    if (!pieces.length) {
      return res
        .status(400)
        .json({ error: 'Please upload a document or paste text to summarize.' });
    }

    const text = pieces.join('\n');
    const result = summarizeText(text);

    const summaryWordCount = result.summary.split(/\s+/).filter(Boolean).length;
    const checkingNeedsAdjustment = result.initialSelection.length !== result.targetSentenceCount;

    const stageList = [];
    stageList.push(
      createStage(
        'Understanding',
        'done',
        `Scanned ${result.sentences.length} sentences (${result.inputWords} words).`,
        { sentenceCount: result.sentences.length, wordCount: result.inputWords }
      )
    );
    stageList.push(
      createStage(
        'Decomposing',
        'done',
        `Planned to score keywords and aim for ${result.targetSentenceCount} summary sentences.`,
        { targetSentenceCount: result.targetSentenceCount }
      )
    );

    const selectedIndexes = result.initialSelection.map((choice) => choice.index + 1).join(', ');
    stageList.push(
      createStage(
        'Executing',
        'done',
        `Generated a draft using sentences ${selectedIndexes}.`,
        {
          initialSentenceCount: result.initialSelection.length,
          targetSentenceCount: result.targetSentenceCount
        }
      )
    );

    stageList.push(
      createStage(
        'Checking',
        checkingNeedsAdjustment ? 'warning' : 'done',
        checkingNeedsAdjustment
          ? `Draft was ${result.initialSelection.length} sentences; trimming to the ${result.targetSentenceCount} sentence target.`
          : `Draft matches the ${result.targetSentenceCount} sentence target.`,
        {
          initialSentenceCount: result.initialSelection.length,
          targetSentenceCount: result.targetSentenceCount
        }
      )
    );

    if (checkingNeedsAdjustment) {
      stageList.push(
        createStage(
          'Adjusting',
          'done',
          `Kept the highest-scoring ${result.finalSelection.length} sentences (trimmed for brevity).`,
          {
            finalSentenceCount: result.finalSelection.length
          }
        )
      );
    } else {
      stageList.push(
        createStage('Adjusting', 'skipped', 'No adjustments necessary.')
      );
    }

    stageList.push(
      createStage(
        'Completed',
        'done',
        `Summary ready (${result.finalSelection.length} sentences, approximately ${summaryWordCount} words).`,
        {
          summarySentenceCount: result.finalSelection.length,
          summaryWordCount
        }
      )
    );

    console.log(`Summarized document (${result.sentences.length} sentences).`);
    res.json({ summary: result.summary, stages: stageList });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({ error: 'Unable to summarize the document.' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unexpected backend error:', err);
  res.status(500).json({ error: 'Unexpected error during summarization.' });
});

app.listen(PORT, () => {
  console.log(`Document summarization backend listening on http://localhost:${PORT}`);
});
