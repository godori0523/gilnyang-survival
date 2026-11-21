# 길냥이 서바이벌

길고양이가 골목의 위험을 버티며 갇힌 고양이를 구해 무리를 만들고, 아지트에서 돌본 뒤 입양 보내는 자동공격 생존 게임입니다.
이미지와 음악 파일 없이 브라우저 캔버스로 모든 그림과 효과음을 만듭니다.

## 구조

| 경로 | 내용 |
|---|---|
| `index.html` | 화면 구조와 스타일 |
| `js/data.js` | 고양이·무기·적·스테이지·업적 표 |
| `js/art.js`, `js/art2.js` | 캐릭터·적·아이콘·바닥 그림 |
| `js/room.js` | 아지트 방 그림 |
| `js/game.js` | 게임 로직 전체 |
| `_headers` | Cloudflare Pages 캐시 설정 |

## 배포 (Cloudflare Pages)

빌드 과정이 없는 정적 사이트입니다. 저장소 맨 위 폴더가 그대로 사이트가 됩니다.

- Framework preset: `None`
- Build command: 비워 둠
- Build output directory: `/`

`main` 브랜치에 올라가면 자동으로 다시 배포됩니다.

## 로컬에서 실행

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000` 을 엽니다.
