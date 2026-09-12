import {
  CLASS_WEIGHTS,
  EVAL_SET_COUNTS,
  OVERALL_METRICS,
  PER_CLASS_METRICS,
  SOURCE_METRICS,
  TRAIN_SETTINGS,
  VAL_ACCURACIES,
} from '../../data/scenarios'
import styles from './ModelPage.module.css'

export function ModelPage() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>CURRENT RESEARCH BUILD</div>
        <h1>About the Model</h1>
      </header>

      <section className={styles.section}>
        <h2>Project Overview</h2>
        <p className={styles.body}>
          This project explores AI-assisted classification of breast histology images into four
          learned classes:
        </p>
        <div className={styles.classes}>
          <div>Benign</div>
          <div>Carcinoma In Situ</div>
          <div>Invasive Carcinoma</div>
          <div>Normal</div>
        </div>
        <p className={styles.body}>
          The classification system is paired with <strong>Grad-CAM++ explainability</strong>, which
          provides visual heatmaps showing regions that contributed to a model&apos;s prediction.
        </p>
        <p className={styles.body}>
          The goal is to explore how deep-learning classification and model interpretability can
          work together, allowing predictions to be inspected rather than treated as a complete
          black box.
        </p>
        <div className={styles.notice}>
          <strong>Research prototype.</strong> This project is intended for academic and research
          demonstration only. It is not a medical diagnostic system and should not be used to make
          clinical decisions.
        </div>
      </section>

      <section className={styles.section}>
        <h2>Dataset</h2>
        <p className={styles.body}>
          The model was trained using breast histology images from two sources:
        </p>
        <ul className={styles.list}>
          <li>The original Kaggle breast histology dataset</li>
          <li>
            An additional breast_benign dataset used to provide Benign examples
          </li>
        </ul>
        <p className={styles.body}>
          After removing duplicate images using <strong>MD5 hashing</strong>, approximately{' '}
          <strong>9,000 images were reduced to 6,995 unique images</strong>.
        </p>
        <p className={styles.body}>
          A <strong>grouped, class-stratified split</strong> was then used to separate the data for
          model development and evaluation while preserving class representation across the splits.
        </p>

        <h3>Evaluation Set</h3>
        <p className={styles.sub}>The final test set contains 1,128 images:</p>
        <div className={styles.panel}>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th className={styles.num}>Test Images</th>
                </tr>
              </thead>
              <tbody>
                {EVAL_SET_COUNTS.map((row) => (
                  <tr key={row.label}>
                    <td className={styles.classCell}>{row.label}</td>
                    <td className={`${styles.support} ${styles.num}`}>{row.support}</td>
                  </tr>
                ))}
                <tr className={styles.totalRow}>
                  <td>Total</td>
                  <td className={styles.num}>1,128</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <h3>Important Dataset Context</h3>
        <p className={styles.body}>
          The original Kaggle dataset did not contribute Benign images to the current test split.
          The <strong>926 Benign test images came from the added breast-benign dataset</strong>,
          while the original Kaggle portion contributed 202 test images consisting of In Situ,
          Invasive, and Normal cases.
        </p>
        <p className={styles.body}>
          This distinction is important when interpreting the reported test performance.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Data Preparation</h2>
        <p className={styles.body}>
          Before training, the dataset went through several preparation steps.
        </p>
        <div className={styles.steps}>
          <article className={styles.step}>
            <div className={styles.stepTitle}>1. Duplicate Removal</div>
            <p className={styles.body}>
              MD5 hashing was used to identify duplicate files and remove repeated images from the
              dataset. This reduced the dataset from approximately{' '}
              <strong>9,000 images to 6,995 unique images</strong>.
            </p>
          </article>
          <article className={styles.step}>
            <div className={styles.stepTitle}>2. Dataset Splitting</div>
            <p className={styles.body}>
              The unique images were divided using a{' '}
              <strong>grouped, class-stratified split</strong>. Grouping helps prevent related
              images from being distributed across different splits, while stratification preserves
              class representation. The resulting training, validation, and test sets were kept
              separate throughout model development and evaluation.
            </p>
          </article>
          <article className={styles.step}>
            <div className={styles.stepTitle}>3. Image Preprocessing</div>
            <p className={styles.body}>Images were prepared for the CNN models by:</p>
            <ul className={styles.list}>
              <li>Converting images to RGB</li>
              <li>
                Resizing them to <strong>224 × 224 pixels</strong>
              </li>
              <li>Converting them to tensors</li>
              <li>
                Normalizing pixel values using the{' '}
                <strong>ImageNet mean and standard deviation</strong>
              </li>
            </ul>
            <p className={styles.body}>
              Training images were also processed using the training augmentation pipeline before
              being passed to the models.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Model Training</h2>
        <p className={styles.body}>
          Four convolutional neural networks were used in the research pipeline:
        </p>
        <div className={styles.classes}>
          <div>ResNet50</div>
          <div>DenseNet121</div>
          <div>EfficientNet-B0</div>
          <div>VGG16</div>
        </div>
        <p className={styles.body}>
          The models were fine-tuned using transfer learning rather than training every parameter
          from scratch.
        </p>
        <p className={styles.body}>
          Because the dataset contained substantially more Benign images than the other classes,{' '}
          <strong>class-weighted cross-entropy</strong> was used to give greater importance to
          underrepresented classes during training.
        </p>

        <div className={styles.split}>
          <div className={styles.panel}>
            <div className={styles.panelHead}>Training Configuration</div>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Setting</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {TRAIN_SETTINGS.map((row) => (
                    <tr key={row.label}>
                      <td className={styles.classCell}>{row.label}</td>
                      <td>
                        {row.label === 'Learning Rate' || row.label === 'Weight Decay' ? (
                          <code>{row.value}</code>
                        ) : (
                          row.value
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelHead}>Class Loss Weights</div>
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th className={styles.num}>Loss Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {CLASS_WEIGHTS.map((row) => (
                    <tr key={row.label}>
                      <td className={styles.classCell}>{row.label}</td>
                      <td className={`${styles.support} ${styles.num}`}>{row.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Model Performance</h2>
        <p className={styles.body}>
          The three strongest newly trained models achieved very high validation accuracy:
        </p>
        <div className={styles.valGrid}>
          {VAL_ACCURACIES.map((row) => (
            <div key={row.label} className={styles.valCard}>
              <div className={styles.valLabel}>{row.label}</div>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
        <p className={styles.body}>
          VGG16 performed substantially worse than the other architectures during retraining,
          reaching a peak validation accuracy of approximately 84%.
        </p>
        <p className={styles.body}>
          The live application therefore uses the newly trained{' '}
          <strong>ResNet50, DenseNet121, and EfficientNet-B0</strong> models together with the
          previous VGG16 checkpoint.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Ensemble Prediction</h2>
        <p className={styles.body}>
          Rather than relying on a single neural network, the system combines predictions from
          multiple models using <strong>soft voting</strong>.
        </p>
        <p className={styles.body}>
          Each model produces probabilities for the four classes. These predictions are combined to
          produce the final ensemble prediction. Using multiple architectures provides a way to
          combine models that learn different visual representations of the same images.
        </p>
        <p className={styles.body}>
          The reported 100% evaluation results below correspond to the{' '}
          <strong>Colab evaluation of all four newly trained checkpoints, including VGG16</strong>.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Test Results</h2>
        <p className={styles.sub}>The current evaluation split produced the following results:</p>
        <div className={styles.metrics}>
          {OVERALL_METRICS.map((m) => (
            <div key={m.label} className={styles.metric}>
              <div className={styles.metricValue}>{m.value}</div>
              <div className={styles.metricLabel}>{m.label}</div>
            </div>
          ))}
        </div>

        <h3>Per-Class Results</h3>
        <div className={styles.panel}>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th className={styles.num}>Precision</th>
                  <th className={styles.num}>Recall</th>
                  <th className={styles.num}>F1</th>
                  <th className={styles.num}>Support</th>
                </tr>
              </thead>
              <tbody>
                {PER_CLASS_METRICS.map((m) => (
                  <tr key={m.label}>
                    <td className={styles.classCell}>{m.label}</td>
                    <td className={styles.num}>{m.precision}</td>
                    <td className={styles.num}>{m.recall}</td>
                    <td className={styles.num}>{m.f1}</td>
                    <td className={`${styles.support} ${styles.num}`}>{m.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className={styles.footnote}>
          Precision: of images predicted as a class, the share that truly belong to it. Recall: of
          images that truly belong to a class, the share correctly identified.
        </p>

        <h3>Results by Dataset Source</h3>
        <div className={styles.panel}>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Dataset Source</th>
                  <th className={styles.num}>Accuracy</th>
                  <th className={styles.num}>Support</th>
                </tr>
              </thead>
              <tbody>
                {SOURCE_METRICS.map((m) => (
                  <tr key={m.label}>
                    <td className={styles.classCell}>{m.label}</td>
                    <td className={styles.num}>{m.accuracy}</td>
                    <td className={`${styles.support} ${styles.num}`}>{m.support}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className={styles.body}>
          The original Kaggle test portion contained In Situ, Invasive, and Normal images. The
          added breast-benign dataset accounted for all Benign images in the current test set.
        </p>

        <h3>Interpreting the 100% Score</h3>
        <div className={styles.notice}>
          <strong>How to read the 100% score.</strong> The 100% result represents performance on
          this specific evaluation split. It does not demonstrate clinical accuracy, clinical
          effectiveness, or reliable performance on unseen patient populations. The Benign class
          comes entirely from the additional breast-benign source. Treat this as an evaluation of
          this research dataset, not evidence that the system is ready for medical use.
        </div>
      </section>

      <section className={styles.section}>
        <h2>Confusion Matrix</h2>
        <p className={styles.body}>
          The confusion matrix shows the relationship between the true class and the class
          predicted by the ensemble.
        </p>
        <div className={styles.matrixWrap}>
          <img
            src="/evaluation_results/confusion_matrix.png"
            alt="Ensemble confusion matrix comparing true vs predicted class on the 1,128-image test split"
            className={styles.matrix}
          />
        </div>
        <p className={styles.footnote}>
          Current test split: 1,128 images. The matrix makes it possible to see where predictions
          were correct or incorrect across the four classes.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Explainability with Grad-CAM++</h2>
        <div className={styles.stack}>
          <p className={styles.body}>
            Model predictions are paired with <strong>Grad-CAM++ heatmaps</strong> to make the
            model&apos;s behavior easier to inspect.
          </p>
          <p className={styles.body}>
            Grad-CAM++ identifies image regions that have a stronger influence on the
            network&apos;s prediction and overlays those regions onto the original image.
          </p>
          <p className={styles.body}>
            This does not provide a pixel-perfect segmentation or prove that the highlighted region
            represents a medically meaningful feature. Instead, it provides a visual indication of
            where the model was focusing when producing its prediction.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Limitations</h2>
        <p className={styles.body}>
          There are several important limitations to this research prototype:
        </p>
        <ul className={styles.list}>
          <li>
            The dataset is relatively small for establishing robust deep-learning generalization.
          </li>
          <li>
            The original dataset did not contribute Benign images to the current test split, so an
            additional Benign dataset was introduced.
          </li>
          <li>The 100% test performance comes from one specific evaluation split.</li>
          <li>Dataset source and composition may influence model performance.</li>
          <li>
            Generalization to different hospitals, laboratories, imaging equipment, patient
            populations, or acquisition conditions has not been established.
          </li>
          <li>
            The model may produce incorrect predictions on images outside the training distribution.
          </li>
          <li>
            VGG16 performed considerably worse than the other newly trained models during
            validation.
          </li>
          <li>
            Grad-CAM++ highlights regions of model influence but does not provide a medically
            validated explanation.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Responsible Use</h2>
        <div className={styles.stack}>
          <p className={styles.bodySm}>
            This system is an <strong>academic research prototype</strong>.
          </p>
          <p className={styles.bodySm}>
            It should not be used to diagnose cancer, rule out cancer, or make treatment decisions.
            Model predictions should not replace assessment by a qualified medical professional.
          </p>
          <p className={styles.bodySm}>
            The purpose of this project is to investigate how deep-learning image classification
            and explainability techniques can be combined to make model predictions easier to
            inspect, evaluate, and understand.
          </p>
        </div>
      </section>
    </div>
  )
}
