function aggregateFrameDetections(frameResults) {
  const classMap = new Map()
  const frameCount = frameResults.length

  frameResults.forEach((frameResult) => {
    const predictions = (frameResult.predictions || []).map(normalizePrediction)

    predictions.forEach((prediction) => {
      const classKey = prediction.className || String(prediction.classId ?? 'unknown')
      const currentClass = classMap.get(classKey) || {
        className: classKey,
        classId: prediction.classId,
        count: 0,
        confidenceTotal: 0,
      }

      currentClass.count += 1
      currentClass.confidenceTotal += prediction.confidence || 0
      classMap.set(classKey, currentClass)
    })
  })

  const classCounts = {}
  const classSummaries = Array.from(classMap.values()).map((entry) => {
    classCounts[entry.className] = entry.count

    return {
      className: entry.className,
      classId: entry.classId,
      count: entry.count,
      averageConfidence:
        entry.count > 0 ? Number((entry.confidenceTotal / entry.count).toFixed(4)) : 0,
    }
  })

  const totalDetections = classSummaries.reduce((sum, entry) => sum + entry.count, 0)

  return {
    frameCount,
    totalDetections,
    classCounts,
    classSummaries,
  }
}

function normalizePrediction(prediction) {
  return {
    x: prediction.x,
    y: prediction.y,
    width: prediction.width,
    height: prediction.height,
    confidence: prediction.confidence,
    className: prediction.class || prediction.className || String(prediction.class_id ?? 'unknown'),
    classId: prediction.class_id ?? prediction.classId,
  }
}

module.exports = { aggregateFrameDetections }
