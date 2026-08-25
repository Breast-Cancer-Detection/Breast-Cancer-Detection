import { IMAGE_MODALITY_LABEL } from '../../data/constants'
import { OVERALL_METRICS, PER_CLASS_METRICS, SOURCE_METRICS } from '../../data/scenarios'
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
        Test support: 1,128 images (Benign 926, In Situ 41, Invasive 81, Normal 80) after MD5
        dedup of 9,000 → 6,995 unique images and a grouped, class-stratified split. The 100%
        scores below are the Colab ensemble of all four newly trained checkpoints, including the
        weak VGG. The live site is the three new backbones plus the previous VGG. Not clinical
        evidence.
      </p>
      <div className={styles.notice}>
        <strong>How to read the 100% score.</strong> All 926 test Benign images came from the
        added breast-benign set. The 202 original-Kaggle test images were In Situ, Invasive, and
        Normal only — original Benign was not in this test split.
      </div>

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

      <h3>Results by dataset</h3>
      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Accuracy</th>
              <th>Support</th>
              <th>What was in the test slice</th>
            </tr>
          </thead>
          <tbody>
            {SOURCE_METRICS.map((m) => (
              <tr key={m.label}>
                <td className={styles.classCell}>{m.label}</td>
                <td>{m.accuracy}</td>
                <td className={styles.support}>{m.support}</td>
                <td>{m.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Confusion matrix</h3>
      <img
        src="/evaluation_results/confusion_matrix.png"
        alt="Ensemble confusion matrix comparing true vs predicted class on the current test split"
        className={styles.matrix}
      />

      <h2>Architecture & preprocessing</h2>

      <h3>Architecture</h3>
      <p className={styles.body}>
        Soft-voting over ResNet50, DenseNet121, EfficientNet-B0, and VGG16. Fine-tuned 5 epochs
        with AdamW (lr 1e-4, weight decay 1e-4) and class-weighted cross-entropy (Benign 0.321;
        In Situ 3.117; Invasive 3.533; Normal 3.576). Data: original Kaggle 4-class histology plus
        maestroalert/cancer <code>breast_benign</code> only. Val acc: ResNet 99.75%, DenseNet
        99.58%, EfficientNet 99.50%. VGG peaked at 84% and was not replaced on the live site.
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
        <li>
          The 100% score is the Colab four-new-checkpoint ensemble, not the live stack (new
          ResNet/DenseNet/EfficientNet + previous VGG)
        </li>
        <li>
          Test split is unbalanced (926 extra-set Benign vs 202 original-Kaggle images with no
          Benign)
        </li>
        <li>Perfect scores here do not imply clinical readiness or generalization</li>
        <li>
          After MD5 (9,000 → 6,995 unique), train still has 3,633 Benign vs ~330 of each other
          class; weights reduce but do not remove that skew
        </li>
        <li>
          Training data is H&amp;E histology from the original Kaggle 4-class set plus
          maestroalert/cancer breast-benign images only
        </li>
        <li>The dataset is still small for robust deep-learning training</li>
        <li>The model may still produce false positives and false negatives on new data</li>
        <li>The model has not been established as clinically effective</li>
        <li>Grad-CAM++ heatmaps highlight regions of influence, not pixel-perfect outlines</li>
      </ul>

      <h2>Responsible use</h2>
      <p className={styles.bodySm}>
        This prototype is intended for academic and research demonstration only. It is not a
        medical diagnosis, and expert review remains necessary for every result.
      </p>
    </div>
  )
}
