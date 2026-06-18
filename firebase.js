// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    push,
    set
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCd7LUP_IDnbdLgIxyj6iGEFtwXbzwubjc",
    authDomain: "database-4d830.firebaseapp.com",
    databaseURL: "https://database-4d830-default-rtdb.firebaseio.com",
    projectId: "database-4d830",
    storageBucket: "database-4d830.firebasestorage.app",
    messagingSenderId: "1011786036842",
    appId: "1:1011786036842:web:f645d6af597e0c22b4bc13",
    measurementId: "G-T5S9KKZ2G8"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

/*
=================================
상품 목록 가져오기
=================================
*/

export async function loadPrizes() {

    try {

        const snapshot = await get(ref(db, "prizes"));

        if (!snapshot.exists()) {
            return [];
        }

        const data = snapshot.val();

        return Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));

    } catch (e) {

        console.error("상품 불러오기 실패", e);

        return [];
    }
}

/*
=================================
랜덤 상품 선택
=================================
*/

export async function getRandomPrize() {

    const prizes = await loadPrizes();

    if (prizes.length === 0) {
        return null;
    }

    const available = prizes.filter(
        p => (p.stock || 0) > 0
    );

    if (available.length === 0) {
        return null;
    }

    const randomIndex =
        Math.floor(Math.random() * available.length);

    return available[randomIndex];
}

/*
=================================
당첨 저장
=================================
*/

export async function saveWin(prize) {

    try {

        const winsRef = ref(db, "wins");

        const newWinRef = push(winsRef);

        await set(newWinRef, {

            prizeId: prize.id,

            name: prize.name,

            image: prize.image || "",

            url: prize.url || "",

            time: Date.now()

        });

        return true;

    } catch (e) {

        console.error("당첨 저장 실패", e);

        return false;
    }
}

/*
=================================
재고 감소
=================================
*/

export async function decreaseStock(prize) {

    try {

        const prizeRef = ref(
            db,
            `prizes/${prize.id}/stock`
        );

        const snapshot = await get(prizeRef);

        if (!snapshot.exists()) {
            return;
        }

        const current = snapshot.val();

        await set(
            prizeRef,
            Math.max(0, current - 1)
        );

    } catch (e) {

        console.error(e);
    }
}
