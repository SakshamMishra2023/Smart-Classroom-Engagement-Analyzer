export const ROBOFLOW_CLASSES = {
  book: { color: '#0ea5e9', label: 'Book' }, // sky-500
  phone: { color: '#ef4444', label: 'Phone' }, // red-500
  reading: { color: '#10b981', label: 'Reading' }, // emerald-500
  bend: { color: '#f59e0b', label: 'Bending' }, // amber-500
  bow_head: { color: '#f59e0b', label: 'Bowed Head' }, // amber-500
  'hand-raising': { color: '#8b5cf6', label: 'Raising Hand' }, // violet-500
  raise_head: { color: '#3b82f6', label: 'Raising Head' }, // blue-500
  sleep: { color: '#ef4444', label: 'Sleeping' }, // red-500
  turn_head: { color: '#f97316', label: 'Turned Head' }, // orange-500
  upright: { color: '#10b981', label: 'Upright' }, // emerald-500
  Using_phone: { color: '#e11d48', label: 'Using Phone' }, // rose-600
  writing: { color: '#14b8a6', label: 'Writing' }, // teal-500
}

export const getActionColor = (className) => {
  return ROBOFLOW_CLASSES[className]?.color || '#94a3b8'
}

export const getActionLabel = (className) => {
  return ROBOFLOW_CLASSES[className]?.label || className
}

export const POSITIVE_ACTIONS = ['upright', 'reading', 'writing', 'hand-raising', 'book']
export const DISTRACTED_ACTIONS = ['sleep', 'phone', 'Using_phone', 'turn_head', 'bend']

// --- SPATIAL ANALYTICS ENGINE ---
const VIDEO_WIDTH = 1920
const VIDEO_HEIGHT = 1080

export const computeZoneAnalytics = (predictions) => {
  const zones = {
    'Back Left': { total: 0, engaged: 0, distracted: 0, actions: {} },
    'Back Right': { total: 0, engaged: 0, distracted: 0, actions: {} },
    'Front Left': { total: 0, engaged: 0, distracted: 0, actions: {} },
    'Front Right': { total: 0, engaged: 0, distracted: 0, actions: {} }
  }

  predictions.forEach(p => {
    // Top of image (y < 540) is assumed Back of Class. Bottom is Front.
    const isBack = p.y < (VIDEO_HEIGHT / 2)
    const isLeft = p.x < (VIDEO_WIDTH / 2)

    let zoneName = ''
    if (isBack && isLeft) zoneName = 'Back Left'
    else if (isBack && !isLeft) zoneName = 'Back Right'
    else if (!isBack && isLeft) zoneName = 'Front Left'
    else zoneName = 'Front Right'

    const zone = zones[zoneName]
    zone.total += 1
    
    if (POSITIVE_ACTIONS.includes(p.class)) zone.engaged += 1
    if (DISTRACTED_ACTIONS.includes(p.class)) zone.distracted += 1
    
    zone.actions[p.class] = (zone.actions[p.class] || 0) + 1
  })

  // Calculate scores and find worst/best zones
  let highestDistraction = 0
  let worstZone = null

  Object.entries(zones).forEach(([name, data]) => {
    // Engagement %
    data.score = data.total > 0 ? Math.round((data.engaged / data.total) * 100) : 100
    
    if (data.distracted > highestDistraction) {
      highestDistraction = data.distracted
      worstZone = name
    }
  })

  // Generate dynamic commentary
  let commentary = "The classroom appears generally focused."
  if (worstZone) {
    const worstData = zones[worstZone]
    const primaryDistraction = Object.entries(worstData.actions)
      .filter(([act]) => DISTRACTED_ACTIONS.includes(act))
      .sort((a,b) => b[1] - a[1])[0]

    commentary = `Attention loss detected primarily in the ${worstZone}. Several students are exhibiting distracted behavior`
    if (primaryDistraction) {
      commentary += `—notably ${primaryDistraction[0].replace('_', ' ')}.`
    } else {
      commentary += "."
    }
  }

  return { zones, commentary, worstZone }
}


export const MOCK_DETECTION_PAYLOAD = {
  predictions: [
    { x: 1243, y: 402, width: 264, height: 186, confidence: 0.942, class: 'upright', class_id: 10, detection_id: 'a7' },
    { x: 527, y: 376.5, width: 212, height: 183, confidence: 0.939, class: 'upright', class_id: 10, detection_id: '2e8' },
    { x: 317.5, y: 364, width: 185, height: 196, confidence: 0.933, class: 'upright', class_id: 10, detection_id: '0bf' },
    { x: 1028, y: 377.5, width: 170, height: 209, confidence: 0.922, class: 'upright', class_id: 10, detection_id: 'c47' },
    { x: 855.5, y: 377, width: 191, height: 200, confidence: 0.921, class: 'upright', class_id: 10, detection_id: 'f9b' },
    { x: 130, y: 260.5, width: 168, height: 141, confidence: 0.919, class: 'upright', class_id: 10, detection_id: '36f' },
    { x: 1729.5, y: 367.5, width: 161, height: 175, confidence: 0.918, class: 'upright', class_id: 10, detection_id: 'cca' },
    { x: 1211, y: 246, width: 112, height: 118, confidence: 0.9, class: 'upright', class_id: 10, detection_id: '921' },
    { x: 1256.5, y: 367.5, width: 91, height: 113, confidence: 0.899, class: 'bow_head', class_id: 3, detection_id: '0f7' },
    { x: 1842.5, y: 401, width: 153, height: 230, confidence: 0.895, class: 'upright', class_id: 10, detection_id: 'a97' },
    { x: 1699, y: 204.5, width: 82, height: 97, confidence: 0.894, class: 'upright', class_id: 10, detection_id: '91f' },
    { x: 1467.5, y: 233, width: 89, height: 100, confidence: 0.893, class: 'upright', class_id: 10, detection_id: 'd5d' },
    { x: 768, y: 237.5, width: 126, height: 113, confidence: 0.892, class: 'upright', class_id: 10, detection_id: '106' },
    { x: 527.5, y: 339.5, width: 83, height: 103, confidence: 0.892, class: 'bow_head', class_id: 3, detection_id: '3f7' },
    { x: 1608.5, y: 320.5, width: 135, height: 137, confidence: 0.892, class: 'upright', class_id: 10, detection_id: 'de8' },
    { x: 1097, y: 222.5, width: 96, height: 85, confidence: 0.89, class: 'upright', class_id: 10, detection_id: '033' },
    { x: 275, y: 153.5, width: 100, height: 87, confidence: 0.889, class: 'upright', class_id: 10, detection_id: '7c9' },
    { x: 1143, y: 313.5, width: 120, height: 103, confidence: 0.886, class: 'bend', class_id: 1, detection_id: 'd04' },
    { x: 298.5, y: 315.5, width: 81, height: 97, confidence: 0.886, class: 'raise_head', class_id: 6, detection_id: '155' },
    { x: 573.5, y: 294.5, width: 75, height: 97, confidence: 0.886, class: 'bow_head', class_id: 3, detection_id: '271' },
    { x: 1005, y: 203.5, width: 90, height: 107, confidence: 0.885, class: 'upright', class_id: 10, detection_id: '3ed' },
    { x: 813, y: 168.5, width: 92, height: 87, confidence: 0.884, class: 'upright', class_id: 10, detection_id: '053' },
    { x: 733.5, y: 151, width: 77, height: 72, confidence: 0.881, class: 'upright', class_id: 10, detection_id: '8d8' },
    { x: 884.5, y: 321, width: 75, height: 88, confidence: 0.88, class: 'raise_head', class_id: 6, detection_id: '92c' },
    { x: 642.5, y: 151, width: 105, height: 102, confidence: 0.879, class: 'upright', class_id: 10, detection_id: '158' },
    { x: 1566.5, y: 233, width: 105, height: 100, confidence: 0.875, class: 'upright', class_id: 10, detection_id: '904' },
    { x: 1196.5, y: 338, width: 67, height: 88, confidence: 0.875, class: 'bow_head', class_id: 3, detection_id: 'aec' },
    { x: 389.5, y: 320, width: 73, height: 96, confidence: 0.873, class: 'bow_head', class_id: 3, detection_id: 'c9a' },
    { x: 989, y: 478.5, width: 74, height: 41, confidence: 0.872, class: 'book', class_id: 2, detection_id: '7b4' },
    { x: 1214, y: 222, width: 52, height: 68, confidence: 0.872, class: 'raise_head', class_id: 6, detection_id: '527' },
    { x: 661, y: 270, width: 94, height: 152, confidence: 0.871, class: 'upright', class_id: 10, detection_id: 'edd' },
    { x: 915, y: 240.5, width: 108, height: 131, confidence: 0.866, class: 'upright', class_id: 10, detection_id: '658' },
    { x: 812.5, y: 158, width: 45, height: 64, confidence: 0.864, class: 'bow_head', class_id: 3, detection_id: 'c7f' },
    { x: 1365, y: 192, width: 72, height: 56, confidence: 0.861, class: 'bend', class_id: 1, detection_id: '250' },
    { x: 853.5, y: 269.5, width: 61, height: 79, confidence: 0.856, class: 'bow_head', class_id: 3, detection_id: '655' },
    { x: 648.5, y: 227, width: 57, height: 64, confidence: 0.854, class: 'raise_head', class_id: 6, detection_id: '5f3' },
    { x: 1637.5, y: 291.5, width: 57, height: 73, confidence: 0.854, class: 'bow_head', class_id: 3, detection_id: 'd7a' },
    { x: 1714, y: 184.5, width: 48, height: 57, confidence: 0.854, class: 'bow_head', class_id: 3, detection_id: '502' },
    { x: 1747.5, y: 321, width: 77, height: 82, confidence: 0.853, class: 'raise_head', class_id: 6, detection_id: 'a86' },
    { x: 561, y: 234.5, width: 68, height: 73, confidence: 0.851, class: 'raise_head', class_id: 6, detection_id: '47f' },
    { x: 994, y: 178, width: 48, height: 60, confidence: 0.849, class: 'raise_head', class_id: 6, detection_id: 'f3f' },
    { x: 1024, y: 322, width: 80, height: 96, confidence: 0.847, class: 'raise_head', class_id: 6, detection_id: '99a' },
    { x: 1523.5, y: 201.5, width: 75, height: 83, confidence: 0.846, class: 'bend', class_id: 1, detection_id: 'a92' },
    { x: 724.5, y: 143, width: 39, height: 56, confidence: 0.845, class: 'bow_head', class_id: 3, detection_id: '746' },
    { x: 1426.5, y: 202, width: 93, height: 90, confidence: 0.842, class: 'bend', class_id: 1, detection_id: '9de' },
    { x: 889.5, y: 211.5, width: 53, height: 71, confidence: 0.842, class: 'bow_head', class_id: 3, detection_id: 'af1' },
    { x: 1877, y: 337, width: 86, height: 100, confidence: 0.842, class: 'raise_head', class_id: 6, detection_id: '89c' },
    { x: 122, y: 234, width: 64, height: 82, confidence: 0.841, class: 'bow_head', class_id: 3, detection_id: 'de8' },
    { x: 492.5, y: 451.5, width: 141, height: 35, confidence: 0.84, class: 'book', class_id: 2, detection_id: '222' },
    { x: 1376.5, y: 186.5, width: 37, height: 45, confidence: 0.839, class: 'bow_head', class_id: 3, detection_id: '005' },
    { x: 1254, y: 466.5, width: 92, height: 43, confidence: 0.828, class: 'Using_phone', class_id: 0, detection_id: 'a77' },
    { x: 892.5, y: 127, width: 41, height: 52, confidence: 0.827, class: 'raise_head', class_id: 6, detection_id: '725' },
    { x: 666.5, y: 130, width: 45, height: 58, confidence: 0.826, class: 'turn_head', class_id: 9, detection_id: 'cf8' },
    { x: 260, y: 139, width: 48, height: 56, confidence: 0.826, class: 'raise_head', class_id: 6, detection_id: '300' },
    { x: 770.5, y: 219, width: 63, height: 74, confidence: 0.825, class: 'bow_head', class_id: 3, detection_id: '4ecc' },
    { x: 67.5, y: 177, width: 77, height: 92, confidence: 0.8, class: 'upright', class_id: 10, detection_id: 'f86' },
    { x: 72.5, y: 166.5, width: 57, height: 69, confidence: 0.794, class: 'bow_head', class_id: 3, detection_id: '611' },
    { x: 578, y: 170.5, width: 46, height: 59, confidence: 0.765, class: 'raise_head', class_id: 6, detection_id: '682' },
    { x: 879, y: 143.5, width: 68, height: 87, confidence: 0.744, class: 'upright', class_id: 10, detection_id: '594' },
    { x: 923.5, y: 157.5, width: 45, height: 61, confidence: 0.742, class: 'raise_head', class_id: 6, detection_id: '47f9' },
    { x: 1068, y: 162, width: 42, height: 54, confidence: 0.717, class: 'bow_head', class_id: 3, detection_id: '11c' },
    { x: 1620.5, y: 371, width: 79, height: 30, confidence: 0.678, class: 'reading', class_id: 7, detection_id: 'a76' },
    { x: 1581, y: 214.5, width: 48, height: 59, confidence: 0.638, class: 'bow_head', class_id: 3, detection_id: 'b74' },
    { x: 1104, y: 211, width: 46, height: 58, confidence: 0.591, class: 'raise_head', class_id: 6, detection_id: '9c0' },
    { x: 32, y: 298, width: 64, height: 198, confidence: 0.578, class: 'upright', class_id: 10, detection_id: '3cc' },
    { x: 1474.5, y: 212, width: 45, height: 56, confidence: 0.576, class: 'bow_head', class_id: 3, detection_id: '63f' },
    { x: 1525, y: 191, width: 48, height: 58, confidence: 0.559, class: 'bow_head', class_id: 3, detection_id: '4e2' },
    { x: 1448.5, y: 188.5, width: 47, height: 59, confidence: 0.543, class: 'bow_head', class_id: 3, detection_id: '93d' },
  ],
}
