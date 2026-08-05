import { IMAGE_MODALITY_LABEL } from '../../data/constants'
import { OVERALL_METRICS, PER_CLASS_METRICS } from '../../data/scenarios'
import styles from './ModelPage.module.css'

export function ModelPage() {
  return (
    <div className={styles.root}>
      <h1>Model details & transparency</h1>
      <div className={styles.eyebrow}>CURRENT RESEARCH BUILD</div>

      <div className={styles.notice}>
        <strong>Imaging-modality confirmation notice:</strong> Final imaging modality and dataset
        description awaiting research-team confirmation.
      </div>

      <h2>Project objective</h2>
      <p className={styles.body}>
        An academic prototype exploring AI-assisted classification of {IMAGE_MODALITY_LABEL}s into
        four learned classes, paired with Grad-CAM explainability so predictions can be visually
        inspected rather than treated as a black box.
      </p>

      <h2>Model evaluation</h2>
      <p className={styles.sub}>
        Test support: 400 images. Results reflect the repository&apos;s current four-model ensemble
        evaluation and do not establish clinical effectiveness.
      </p>

      <div className={styles.metrics}>
        {OVERALL_METRICS.map((m) => (
          <div key={m.label} className={styles.metric}>
            <div className={styles.metricValue}>{m.value}</div>
            <div className={styles.metricLabel}>{m.label}</div>
          </div>
        ))}
      </div>

      <h3>Per-class results</h3>
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1</th>
              <th>Support</th>
            </tr>
          </thead>
          <tbody>
            {PER_CLASS_METRICS.map((m) => (
              <tr key={m.label}>
                <td className={styles.classCell}>{m.label}</td>
                <td>{m.precision}</td>
                <td>{m.recall}</td>
                <td>{m.f1}</td>
                <td className={styles.support}>{m.support}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.footnote}>
        Precision: of images predicted as a class, the share that truly belong to it. Recall: of
        images that truly belong to a class, the share correctly identified.
      </p>

      <h3>Confusion matrix</h3>
      <img
        src="/evaluation_results/confusion_matrix.png"
        alt="Ensemble confusion matrix comparing true vs predicted class on the current test split"
        className={styles.matrix}
      />

      <h2>Architecture & preprocessing</h2>
      <div className={styles.archGrid}>
        <div>Backbones: DenseNet121, EfficientNet-B0, VGG16, and ResNet50</div>
        <div>Ensemble: equal-weight soft voting across model probabilities</div>
        <div>Framework: PyTorch CNN classifiers</div>
        <div>Classifier heads adapted for four output classes</div>
        <div>Loss: Cross-entropy · AdamW</div>
        <div>LR 0.0001 · Weight decay 0.0001</div>
      </div>
      <p className={styles.bodySm}>
        Images are converted to RGB, resized to 224 × 224, converted to a tensor, and normalized
        using ImageNet statistics. Files below 32 × 32 pixels are rejected before inference; files
        with &quot;mask&quot; in the filename are treated as segmentation masks and are not
        accepted as classification inputs.
      </p>
      <p className={styles.bodySm}>Supported extensions: JPG, JPEG, PNG, BMP.</p>
      <p className={styles.bodySm}>
        Grad-CAM uses each model&apos;s final convolutional layer to build a class-specific map,
        normalized, resized to 224 × 224, and overlaid at a default opacity of 45% with a
        jet-style color scale.
      </p>

      <h2>Output classes</h2>
      <div className={styles.classes}>
        <div>
          <code>Benign</code> → Benign
        </div>
        <div>
          <code>Carcinoma_InSitu</code> → Carcinoma In Situ
        </div>
        <div>
          <code>Carcinoma_Invasive</code> → Invasive Carcinoma
        </div>
        <div>
          <code>Normal</code> → Normal
        </div>
      </div>

      <h2>Limitations</h2>
      <ul className={styles.limits}>
        <li>Current evaluation accuracy is 86.75%</li>
        <li>Benign recall is currently 76.52%</li>
        <li>The model may produce false positives and false negatives</li>
        <li>Image quality and dataset differences may affect results</li>
        <li>The model has not been established as clinically effective</li>
        <li>Grad-CAM is a coarse explanatory map</li>
        <li>Final imaging modality and dataset documentation require team confirmation</li>
      </ul>

      <h2>Responsible use</h2>
      <p className={styles.bodySm}>
        This prototype is intended for academic and research demonstration only. It is not a
        medical diagnosis, and expert review remains necessary for every result.
      </p>
    </div>
  )
}
