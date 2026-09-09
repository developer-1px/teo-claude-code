---
name: responsibility-surface-refactor
description: 실제 외부 public surface를 보존하는 내부 책임 분리와 app-internal facade 제거를 구분한다. package index·facade를 유지한 리팩터링이나 public API 호환성 판단에 사용하며 내부 re-export 경로 보존에는 사용하지 않는다.
---

# 책임 표면 리팩터링

검증된 외부 public contract의 내부 구현을 나눌 때 적용한다. 현재 consumer
뿐 아니라 배포된 package export와 문서화된 호환성 약속도 계약의 근거다.

- `index.ts`에서 re-export된다는 사실은 public API의 증거가 아니다.
- 같은 app 안의 importer 수는 package public API의 증거가 아니다.
- 외부 consumer는 다른 package나 repository가 package export를 통해 사용하는 경우다. 저장소 안에서 consumer를 찾지 못했다고 배포된 외부 사용까지 없다고 단정하지 않는다.
- 같은 app의 서로 다른 route·use case가 공유하면 global residency의 근거는 될 수 있지만 외부 호환성 보존 근거는 아니다.
- app-internal facade가 정본 contract를 rename·forward만 하면 소비자를 원자적으로 옮기고 facade를 삭제한다.
- 정본 client 교체를 public-surface-preserving refactor로 처리하지 않는다.
- 실제 외부 계약을 유지하는 경우에만 facade 뒤의 구현을 독립된 변경 이유별로 나눈다.
