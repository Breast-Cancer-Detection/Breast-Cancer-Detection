import { IMAGE_MODALITY_LABEL } from '../../data/constants'
import { OVERALL_METRICS, PER_CLASS_METRICS } from '../../data/scenarios'
import styles from './ModelPage.module.css'

export function ModelPage() {
  return (
    <div className={styles.root}>
      <h1>Model details & transparency</h1>
      <div className={styles.eyebrow}>CURRENT RESEARCH BUILD</div>

      <h2>Project objective</h2>
      <p className={styles.body}>
        An academic prototype exploring AI-assisted classification of {IMAGE_MODALITY_LABEL}s into
        four learned classes, paired with Grad-CAM++ explainability so predictions can be visually
        inspected rather than treated as a black box.
      </p>

      <h2>Model evaluation</h2>
      <p className={styles.sub}>
        Test support: 200 images (50 per class, stratified). Results reflect the repository&apos;s
        current four-model soft-voting ensemble and do not establish clinical effectiveness.
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

      <h3>Architecture</h3>
      <p className={styles.body}>
        Four CNN models (ResNet50, DenseNet121, EfficientNet-B0, VGG16) each predict class
        probabilities. Those probabilities are averaged (soft voting) into one final prediction.
        Models were fine-tuned in PyTorch with AdamW (learning rate 1e-4, weight decay 1e-4) and
        cross-entropy loss.
      </p>

      <h3>Preprocessing</h3>
      <p className={styles.bodySm}>
        Uploaded images are validated, converted to RGB, resized to 224 × 224, converted to tensors,
        and normalized with ImageNet mean/std values before inference. Images smaller than 32 × 32
        are rejected, and files with &quot;mask&quot; in the filename are blocked as segmentation
        inputs. Supported formats: JPG, JPEG, PNG, and BMP.
      </p>

      <h2>Output classes</h2>
      <div className={styles.classes}>
        <div>Benign</div>
        <div>Carcinoma In Situ</div>
        <div>Invasive Carcinoma</div>
        <div>Normal</div>
      </div>

      <h2>Limitations</h2>
      <ul className={styles.limits}>
        <li>Current held-out test accuracy is 100.00% (200 images; stratified split)</li>
        <li>Perfect scores on this dataset do not imply clinical readiness or generalization</li>
        <li>The histology dataset is too small for robust deep-learning training</li>
        <li>The model may still produce false positives and false negatives on new data</li>
        <li>Image quality and dataset differences may affect results</li>
        <li>The model has not been established as clinically effective</li>
        <li>Grad-CAM++ heatmaps highlight regions of influence, not pixel-perfect outlines</li>
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
