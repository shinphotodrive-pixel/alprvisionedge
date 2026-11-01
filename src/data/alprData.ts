export interface DetectionModel {
  id: string;
  name: string;
  family: 'YOLOv8' | 'YOLOv9' | 'YOLOv10' | 'YOLOv11' | 'YOLOv12' | 'RT-DETR';
  params: number; // M
  flops: number; // GFLOPs
  map50_95: number; // %
  latencyA100: number; // ms
  latencyOrin: number; // ms
  latencyRK3588: number; // ms
  nmsRequired: boolean;
  architecture: string;
  recommendedUse: string;
  strengths: string[];
}

export const DETECTION_MODELS: DetectionModel[] = [
  {
    id: 'yolov8n',
    name: 'YOLOv8-Nano',
    family: 'YOLOv8',
    params: 3.2,
    flops: 8.7,
    map50_95: 37.3,
    latencyA100: 0.99,
    latencyOrin: 4.8,
    latencyRK3588: 7.2,
    nmsRequired: true,
    architecture: 'Anchor-free, C2f 멀티스케일 모듈, SPPF 공간 피라미드 풀링',
    recommendedUse: '단일 라즈베리 파이 5 / 초저전력 IoT 엣지 카메라',
    strengths: ['초경량 풋프린트', '광범위한 오픈소스 생태계', '쉬운 경량화 배포']
  },
  {
    id: 'yolov8s',
    name: 'YOLOv8-Small',
    family: 'YOLOv8',
    params: 11.2,
    flops: 28.6,
    map50_95: 44.9,
    latencyA100: 1.54,
    latencyOrin: 7.6,
    latencyRK3588: 12.4,
    nmsRequired: true,
    architecture: 'C2f 블록 스케일링, Decoupled Head 구조',
    recommendedUse: '주차 관제 정주차 게이트 / 스마트 톨게이트 표준',
    strengths: ['속도와 정확도의 검증된 밸런스', '낮은 메모리 점유']
  },
  {
    id: 'yolov8x',
    name: 'YOLOv8-XLarge',
    family: 'YOLOv8',
    params: 68.2,
    flops: 257.8,
    map50_95: 53.9,
    latencyA100: 3.53,
    latencyOrin: 21.0,
    latencyRK3588: 42.0,
    nmsRequired: true,
    architecture: '심층 C2f 백본, 최대 채널 피처맵 추출',
    recommendedUse: '고해상도 4K 광각 다차선 중앙 서버 관제',
    strengths: ['원거리 미소 번호판 검출 능력 우수']
  },
  {
    id: 'yolov9c',
    name: 'YOLOv9-Compact',
    family: 'YOLOv9',
    params: 25.3,
    flops: 102.1,
    map50_95: 53.0,
    latencyA100: 2.72,
    latencyOrin: 13.8,
    latencyRK3588: 27.5,
    nmsRequired: true,
    architecture: 'GELAN(일반화된 효율적 레이어 결합망) + PGI(프로그래밍 가능 그래디언트 정보)',
    recommendedUse: '심층 그래디언트 병목 방지가 필수적인 도시 간선망 복합 관제',
    strengths: ['PGI를 통한 정보 병목 해소', '풍부한 특징 보존', '높은 파라미터 활용도']
  },
  {
    id: 'yolov9e',
    name: 'YOLOv9-Extended',
    family: 'YOLOv9',
    params: 57.3,
    flops: 189.0,
    map50_95: 55.6,
    latencyA100: 4.10,
    latencyOrin: 24.5,
    latencyRK3588: 48.0,
    nmsRequired: true,
    architecture: '확장 PGI 구조, 멀티 레벨 가역적 그래디언트 패스',
    recommendedUse: '악천후 폭우/안개 속 원거리 대형 고속도로 감시',
    strengths: ['심층 백본 정보 유실 제로', '고난도 경계선 포착 탁월']
  },
  {
    id: 'yolov10n',
    name: 'YOLOv10-Nano',
    family: 'YOLOv10',
    params: 2.3,
    flops: 6.7,
    map50_95: 39.5,
    latencyA100: 1.84,
    latencyOrin: 5.2,
    latencyRK3588: 8.1,
    nmsRequired: false,
    architecture: 'Consistent Dual Assignments(일관된 이중 할당), NMS-Free End-to-End',
    recommendedUse: '도심지 초고속 차량 밀집 교차로 및 혼잡 구역',
    strengths: ['후처리 NMS 오버헤드 0ms', '다중 중복 박스 경쟁 제거', '낮은 추론 지터(Jitter)']
  },
  {
    id: 'yolov10s',
    name: 'YOLOv10-Small',
    family: 'YOLOv10',
    params: 7.2,
    flops: 21.6,
    map50_95: 46.7,
    latencyA100: 2.49,
    latencyOrin: 7.8,
    latencyRK3588: 13.0,
    nmsRequired: false,
    architecture: 'Rank-guided Block Design, Partial Self-Attention (PSA)',
    recommendedUse: '실시간 가변 차로 감시 및 역주행 긴급 감지 시스템',
    strengths: ['NMS 배제로 동시 탐지 차량 수에 따른 지연 불변']
  },
  {
    id: 'yolov11n',
    name: 'YOLOv11-Nano',
    family: 'YOLOv11',
    params: 2.6,
    flops: 6.5,
    map50_95: 39.0,
    latencyA100: 1.50,
    latencyOrin: 4.9,
    latencyRK3588: 7.5,
    nmsRequired: true,
    architecture: 'C3k2 개선 블록, SPPELAN 어텐션 통합 설계',
    recommendedUse: '이동형 순찰차량 탑재형 번호판 실시간 단속',
    strengths: ['파라미터 대비 향상된 특징 융합', '빠른 수렴 속도']
  },
  {
    id: 'yolov11s',
    name: 'YOLOv11-Small',
    family: 'YOLOv11',
    params: 9.4,
    flops: 21.5,
    map50_95: 47.0,
    latencyA100: 2.20,
    latencyOrin: 7.2,
    latencyRK3588: 12.0,
    nmsRequired: true,
    architecture: 'C3k2 블록 확장 + 개선된 FPN-PAN 네크 구조',
    recommendedUse: '도심지 교차로 다중 카메라 스마트 방범 관제',
    strengths: ['소형 차량 및 오토바이 번호판 검출 강화', '낮은 메모리 풋프린트']
  },
  {
    id: 'yolov12n',
    name: 'YOLOv12-Nano',
    family: 'YOLOv12',
    params: 2.6,
    flops: 6.5,
    map50_95: 41.2,
    latencyA100: 1.20,
    latencyOrin: 4.6,
    latencyRK3588: 7.0,
    nmsRequired: true,
    architecture: '컨볼루션-트랜스포머 하이브리드 어텐션, 영역 중심 토큰화',
    recommendedUse: '고속도로 과속 단속 및 연속 번호판 연속 프레임 추적',
    strengths: ['Nano급 최강 mAP 달성', '미세 윤곽 인식률 대폭 강화']
  },
  {
    id: 'yolov12m',
    name: 'YOLOv12-Medium',
    family: 'YOLOv12',
    params: 20.1,
    flops: 68.0,
    map50_95: 52.1,
    latencyA100: 2.40,
    latencyOrin: 11.2,
    latencyRK3588: 22.5,
    nmsRequired: true,
    architecture: 'Flash-Attention 최적화 모듈, 고속 트랜스포머 블록',
    recommendedUse: '0.1% 인식 누락도 허용되지 않는 하이패스/톨게이트',
    strengths: ['SOTA 정밀도', '조명 변화 및 빗물 반사에 강건']
  },
  {
    id: 'rtdetr_r18',
    name: 'RT-DETR-R18',
    family: 'RT-DETR',
    params: 20.0,
    flops: 60.0,
    map50_95: 46.5,
    latencyA100: 4.58,
    latencyOrin: 13.5,
    latencyRK3588: 24.0,
    nmsRequired: false,
    architecture: 'Vision Transformer, 하이브리드 인코더, NMS-free 쿼리 디코더',
    recommendedUse: '야간 조명 반사, 무작위 오클루전, 표지판 교란 다중 차선',
    strengths: ['전역(Global) 셀프 어텐션', '주변 도로 간판/표지판 오탐지 최소화', 'NMS 불필요']
  },
  {
    id: 'rtdetr_r50',
    name: 'RT-DETR-R50',
    family: 'RT-DETR',
    params: 42.0,
    flops: 136.0,
    map50_95: 53.1,
    latencyA100: 6.80,
    latencyOrin: 26.0,
    latencyRK3588: 51.0,
    nmsRequired: false,
    architecture: 'ResNet50 백본 + CCFM 멀티스케일 피처 융합 + 디포머블 디코더',
    recommendedUse: '국가 주요 보안 관제 구역 및 고해상도 공항 진출입로',
    strengths: ['복잡한 교란 요소 속 번호판 형태 완전 분리', '극대화된 수용장(Receptive Field)']
  }
];

export interface OcrModel {
  id: string;
  name: string;
  type: string;
  normalAcc: number; // %
  nightAcc: number; // %
  glareAcc: number; // %
  blurAcc: number; // %
  avgCer: number; // %
  latencyMs: number; // ms
  architecture: string;
  suitableLanguage: string;
  strengths: string;
}

export const OCR_MODELS: OcrModel[] = [
  {
    id: 'lprnet',
    name: 'LPRNet',
    type: 'Fully Convolutional (CNN)',
    normalAcc: 95.0,
    nightAcc: 78.2,
    glareAcc: 71.5,
    blurAcc: 61.0,
    avgCer: 5.4,
    latencyMs: 1.8,
    architecture: '1x13 비대칭 컨볼루션, RNN 제거, CTC 손실 함수',
    suitableLanguage: '단순 영숫자 / 1행 규격 번호판',
    strengths: '초경량, 임베디드 CPU(Raspberry Pi)에서도 100+ FPS 가능, 메모리 3MB 이하'
  },
  {
    id: 'crnn',
    name: 'CRNN',
    type: 'CNN + BiLSTM + CTC',
    normalAcc: 96.2,
    nightAcc: 81.0,
    glareAcc: 76.4,
    blurAcc: 68.5,
    avgCer: 4.1,
    latencyMs: 4.2,
    architecture: 'ResNet 피처 추출 + BiLSTM 시퀀스 모델링 + CTC 디코더',
    suitableLanguage: '영숫자 및 기본 한글 텍스트',
    strengths: '상용 솔루션의 업계 표준, 글자 수 가변 대응 우수하나 BiLSTM 순차 연산 병목 존재'
  },
  {
    id: 'parseq',
    name: 'PARSeq',
    type: 'Permuted Autoregressive (ViT)',
    normalAcc: 98.1,
    nightAcc: 92.5,
    glareAcc: 89.8,
    blurAcc: 84.2,
    avgCer: 2.1,
    latencyMs: 7.5,
    architecture: '순열 자기가회귀 Transformer 디코더, 양방향 컨텍스트 결합',
    suitableLanguage: '전 세계 다국어 번호판 및 심각한 난반사 텍스트',
    strengths: '불량 이미지 및 렌즈 플레어 조건에서 최저 CER 기록, 앞뒤 문자 문맥 유추 탁월'
  },
  {
    id: 'svtr',
    name: 'SVTR (PP-OCRv4)',
    type: 'Single Visual Model (Patch ViT)',
    normalAcc: 98.9,
    nightAcc: 94.1,
    glareAcc: 92.3,
    blurAcc: 88.0,
    avgCer: 1.6,
    latencyMs: 6.0,
    architecture: '패치 토큰화, 국소(Local) 및 전역(Global) 혼합 셀프 어텐션',
    suitableLanguage: '한글(초성·중성·종성 결합) 및 복잡 2D 한자 번호판 최적',
    strengths: '2D 문자 공간 구조를 원형 그대로 보존, 한글 오인식(예: 가/나, 오/우) 최소화'
  }
];

export interface HardwarePlatform {
  name: string;
  vendor: string;
  npuPower: string;
  runtimeEngine: string;
  quantFormat: string;
  fpsYolo: string;
  charAccuracy: string;
  powerWatt: string;
  costTier: '경제형' | '보급형' | '고성능 서버급';
  evaluation: string;
}

export const HARDWARE_PLATFORMS: HardwarePlatform[] = [
  {
    name: 'NVIDIA Jetson Orin NX (16GB)',
    vendor: 'NVIDIA',
    npuPower: '100 TOPS (INT8)',
    runtimeEngine: 'TensorRT 8.6+ / DeepStream 6.4',
    quantFormat: 'INT8 (QAT 권장) / FP16',
    fpsYolo: '120+ FPS (4채널 1080p 동시)',
    charAccuracy: '99.1%',
    powerWatt: '20W ~ 25W',
    costTier: '고성능 서버급',
    evaluation: '다중 차선 고해상도 RTSP 스트림 동시 추론 및 Vehicle Re-ID 융합에 최적'
  },
  {
    name: 'Rockchip RK3588 SoC',
    vendor: 'Rockchip',
    npuPower: '6 TOPS (3-Core NPU)',
    runtimeEngine: 'RKNN-Toolkit2 (v1.6+)',
    quantFormat: 'INT8 (QAT 교정 필수)',
    fpsYolo: '60+ FPS (2채널 1080p)',
    charAccuracy: '98.4%',
    powerWatt: '6W ~ 12W',
    costTier: '보급형',
    evaluation: '전력 대비 가성비(TOPS/W)가 극대화된 국산/산업용 엣지 함체(Edge Box) 선도 칩셋'
  },
  {
    name: 'Hailo-8 M.2 AI Acceleration Module',
    vendor: 'Hailo',
    npuPower: '26 TOPS',
    runtimeEngine: 'Hailo Dataflow Compiler',
    quantFormat: 'INT8 (Hardware Native)',
    fpsYolo: '85+ FPS',
    charAccuracy: '98.6%',
    powerWatt: '2.5W ~ 5W',
    costTier: '보급형',
    evaluation: '호스트 CPU(x86/ARM) 부하를 완전히 분리하여 기존 산업용 PC 확장 카드에 적합'
  },
  {
    name: 'NVIDIA Jetson Nano (4GB)',
    vendor: 'NVIDIA',
    npuPower: '0.5 TOPS (FP16)',
    runtimeEngine: 'TensorRT 8.0',
    quantFormat: 'FP16',
    fpsYolo: '27 FPS (YOLOv8n 단일 채널)',
    charAccuracy: '95.0%',
    powerWatt: '5W ~ 10W',
    costTier: '경제형',
    evaluation: '단일 차선 저비용 독립형 주차장 차단기 제어기에 한정 적용 가능'
  }
];

export interface PipelineStepDetail {
  step: number;
  name: string;
  subTitle: string;
  latencyMs: number;
  environment: string;
  inputOutput: string;
  coreTech: string;
  bottlenecks: string;
  color: string;
}

export const PIPELINE_STEPS: PipelineStepDetail[] = [
  {
    step: 1,
    name: '프레임 입력 & 비디오 디코딩',
    subTitle: 'RTSP / NVMM Zero-Copy',
    latencyMs: 1.2,
    environment: 'GPU Hardware Decoder (NVDEC / VPU)',
    inputOutput: '1080p RTSP H.264/H.265 Stream -> NVMM YUV420 Surface Memory',
    coreTech: 'NVIDIA DeepStream gst-nvstreammux 및 하드웨어 가속 디코더 파이프라인',
    bottlenecks: 'CPU 메모리(RAM)와 GPU VRAM 간 불필요한 Copy 완벽 차단(Zero-Copy) 필수',
    color: '#0284c7'
  },
  {
    step: 2,
    name: '차량 & 번호판 영역 탐지',
    subTitle: 'YOLOv10 / RT-DETR',
    latencyMs: 4.5,
    environment: 'TensorRT FP16/INT8 Primary GIE Engine',
    inputOutput: 'Full Frame RGB Tensor (640x640) -> Vehicle & Plate Bounding Boxes',
    coreTech: 'Consistent Dual Assignments NMS-free(YOLOv10) 또는 Hybrid Encoder(RT-DETR)',
    bottlenecks: '원거리 미소 번호판(32x16px) 검출을 위한 P2/P3 고해상도 피처 레이어 유지',
    color: '#6366f1'
  },
  {
    step: 3,
    name: '기하학적 공간 보정 & 초해상도 복원',
    subTitle: 'STN / CLAHE / Real-ESRGAN',
    latencyMs: 8.1,
    environment: 'CUDA Warp Affine Kernel & TensorRT Latent Super-Resolution',
    inputOutput: 'Warped Low-Res Plate ROI -> Rectified 360x100 High-Contrast Clear Tensor',
    coreTech: '미분 가능한 STN(Spatial Transformer Network) + CLAHE 적응형 평활화 + Real-ESRGAN',
    bottlenecks: 'STN 그리드 생성기 연산 지연 최소화 및 GAN 모델 경량화(INT8 양자화) 관건',
    color: '#f59e0b'
  },
  {
    step: 4,
    name: '번호판 문자 시퀀스 해독 (OCR)',
    subTitle: 'SVTR / PARSeq / LPRNet',
    latencyMs: 6.2,
    environment: 'TensorRT Secondary GIE Engine',
    inputOutput: 'Rectified Plate Image -> License Plate String ("370가 8294") & Confidence',
    coreTech: 'Patch-wise Vision Transformer 어텐션 또는 Permuted Autoregressive 디코딩',
    bottlenecks: '한글 음절(초/중/종성) 결합 규칙 검증 및 국가별 규격 정규식 후처리 검증 필터',
    color: '#10b981'
  },
  {
    step: 5,
    name: '메타데이터 생성 & 차량 Re-ID 융합',
    subTitle: 'DeepStream & NvDCF Tracker',
    latencyMs: 2.0,
    environment: 'DeepStream Analytics & Kafka Message Broker',
    inputOutput: 'Vehicle Track ID, Speed, Plate Text, 512-d Re-ID Vector -> Central Control Dashboard',
    coreTech: 'NvDCF 궤적 상관 필터 + Visual Appearance Feature Embedding 거리 측정',
    bottlenecks: '대형 트럭 가림(Occlusion) 시 번호판 소실에도 외형 벡터로 Track ID 영속성 보장',
    color: '#f43f5e'
  }
];

export interface DeepStreamNode {
  id: string;
  name: string;
  role: string;
  gstreamerPlugin: string;
  memoryType: string;
  details: string;
  optimizationTips: string;
}

export const DEEPSTREAM_NODES: DeepStreamNode[] = [
  {
    id: 'streammux',
    name: 'gst-nvstreammux',
    role: '다채널 스트림 집합 & 배치 버퍼 패킹',
    gstreamerPlugin: 'Gst-nvstreammux (Batch size: N)',
    memoryType: 'NVMM (CUDA Zero-Copy Surface)',
    details: '다수의 RTSP IP 카메라(H.264/H.265) 비디오 스트림을 단일 동기화 텐서 배치로 패킹합니다. GPU 메모리 내부에서 연속 프레임을 할당하여 호스트 CPU 메모리로의 복사를 완전히 배제합니다.',
    optimizationTips: '배치 타임아웃(batched-push-timeout)을 33,000µs(30FPS)로 설정하여 비동기 지연을 방지합니다.'
  },
  {
    id: 'infer_primary',
    name: 'gst-nvinfer (Primary GIE)',
    role: '차량(Car/Truck/Bus) 및 번호판 BBox 1차 검출',
    gstreamerPlugin: 'Gst-nvinfer (Engine: YOLOv10 / RT-DETR)',
    memoryType: 'FP16 / INT8 TensorRT Engine',
    details: '프레임 전체에서 움직이는 차량 및 번호판 사각 좌표를 실시간 추론합니다. YOLOv10 채택 시 NMS 연산이 생략되어 GPU 점유율이 24% 절감됩니다.',
    optimizationTips: '클러스터 모드(cluster-mode)를 NMS-Free 바이패스로 지정하여 불필요한 후처리 CPU 개입을 차단합니다.'
  },
  {
    id: 'tracker',
    name: 'gst-nvtracker',
    role: 'GPU 가속 다중 객체 추적(MOT) & ID 할당',
    gstreamerPlugin: 'Gst-nvtracker (NvDCF / DeepSORT)',
    memoryType: 'GPU Optical Flow & State Vector',
    details: '프레임마다 딥러닝 검출기를 재실행하지 않더라도, 판별 상관 필터(NvDCF)를 활용해 각 차량에 유니크한 Track ID(예: #Vehicle-802)를 영속적으로 부여합니다.',
    optimizationTips: 'Track ID 수명 주기(maxShadowTrackingAge)를 30프레임으로 설정하여 교차로 사각지대 이탈을 방지합니다.'
  },
  {
    id: 'infer_secondary',
    name: 'gst-nvinfer (Secondary GIE)',
    role: '번호판 잘라내기(Crop) 이미지 대상 OCR 추론',
    gstreamerPlugin: 'Gst-nvinfer (Engine: SVTR / PARSeq)',
    memoryType: 'Batched Crop Surface Tensor',
    details: 'Primary 탐지기에서 검출된 번호판 영역만을 GPU 내부에서 다이렉트 크롭(Crop & Scale)하여 SVTR 문자 인식 엔진으로 공급합니다. 빈 프레임 연산을 원천 배제합니다.',
    optimizationTips: 'operate-on-class-ids=1 (License Plate)로 한정하여 차량 바디에 대한 불필요한 2차 추론을 방지합니다.'
  },
  {
    id: 'analytics',
    name: 'gst-nvdsanalytics',
    role: '규칙 기반 이벤트 탐지 (과속, 역주행, 지정선 침범)',
    gstreamerPlugin: 'Gst-nvdsanalytics (ROI & Line Crossing)',
    memoryType: 'CPU/GPU Event Metadata',
    details: '가상의 진입선(Tripwire) 및 위험 구역(ROI)을 설정하여 제한속도 초과, 버스전용차로 위반, 일방통행 역주행 발생 시 즉각 경보 플래그를 세팅합니다.',
    optimizationTips: '방향성 벡터(Direction Vector)를 사전 캘리브레이션하여 차선 변경 시의 허위 경보를 차단합니다.'
  },
  {
    id: 'msgbroker',
    name: 'gst-nvmsgbroker',
    role: '클라우드 & 중앙 관제 프로토콜 메타데이터 송출',
    gstreamerPlugin: 'Gst-nvmsgbroker (Kafka / MQTT / REST)',
    memoryType: 'JSON Schema Payload',
    details: '식별된 번호판 텍스트, 신뢰도, 속도, 방향, 512차원 Re-ID 외형 특징 벡터를 표준 스마트 시티 통합 관제망으로 지연 없이 브로드캐스트합니다.',
    optimizationTips: 'TCP Keep-Alive 및 비동기 큐 버퍼링으로 네트워크 일시 단절 시에도 데이터 유실을 방지합니다.'
  }
];
