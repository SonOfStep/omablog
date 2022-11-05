---
layout: "../../layout/PostPage.astro"
title: "Реализация предварительного просмотра Astro в безголовой Statamic"
description: "Использование Astro c различными безголовыми CMS является хорошим и относительно легко достижимом. Единственная проблема заключается в работе с предварительным просмотром."
imgSrc: "/images/static-astro.jpg"
date: 1667520000000
---

Данная статья является переводом [другой статьи](https://maciekpalmowski.dev/implementing-live-previews-in-headless-statamic-when-using-astro/)

Я уже писал статью об этом для [Buddy](https://buddy.works/guides/statamic-rest-api) об использовании безголового Statamic. Если вы хотите узнать кое-что о себе, сначала отправляйтесь туда

## Почему это проблема?

**Astro**, по умолчанию, является генератором статического сайта, что означает, что каждый раз, когда мы что-то меняем в нашем контенте, мы должны перестраивать весь веб-сайт. А это означало бы ожидание каждого изменения.

## Server Side Rendering приходит на помощь

**Astro** представила SSR некоторое время назад, и, используя это, мы можем создавать предварительные просмотры (и многие другие интересные вещи), не перестраивая все заново. Нам просто понадобится один дополнительный сервер, на котором будет работать SSR (например, **Netlify**).

Также стоит упомянуть, что мы можем использовать аналогичный метод не только для **Astro**, но и для других фреймворков Jamstack, которые имеют возможность использовать SSR.

Давайте представим, что наша страница выглядит следующим образом:

```js
---
const API_URL = 'YOUR_DOMAIN';
let post = {};

export async function getStaticPaths() {

    const res = await fetch( `${API_URL}/collections/pages/entries/` );
    const posts = res.json();
    return posts.data.map((post) => {
		return {
			params: { slug: post.slug },
			props: { post } };
		}
	);
}

const {post} = Astro.props;
---
<html>
	<head>
		<title>{post.title}</title>
	</head>

	<body>
		<main>
			<article>
				<h1>{post.title}</h1>
				<div set:html={post.content}></div>
			</article>
		</main>
	</body>
</html>

```

Просто, верно?

Давайте добавим какой-то простой SSR

```js
---
const API_URL = `YOUR DOMAIN`;
//let's store is_preview as an environmental variable
const is_preview = import.meta.env.PREVIEW;
let post = {};

export async function getStaticPaths() {
    const res = await fetch( `${API_URL}/collections/pages/entries/` );
   const posts = res.json();
    return posts.data.map((post) => {
		return {
			params: { slug: post.slug },
			props: { post } };
		}
	);
}

// if true - SSR
if ( is_preview ) {
	post = await fetch( `${API_URL}/collections/pages/entries/` + `${Astro.params.slug}` );
	const res = await post.json();
	post = await res.data;
} else {
	const {post} = Astro.props;
}
---

<html>
	<head>
		<title>{post.title}</title>
	</head>

	<body>
		<main>
			<article>
				<h1>{post.title}</h1>
				<div set:html={post.content}></div>
			</article>
		</main>
	</body>
</html>
```

Давайте посмотрим, что здесь произошло.

Прежде всего, мы добавляем is_preview, благодаря установке его как true или false, мы сможем заполнять данные правильными значениями.

Кроме того, важно знать, что getStaticPaths игнорируется при работе в режиме SSR.
Выглядит хорошо? Более или менее - время идти в **Statamic**.

## Предварительный просмотр в Statamic

**Statamic** имеет классную функцию, которая позволяет нам изменять URL-адрес предварительного просмотра. Перейдите на [эту страницу](https://statamic.dev/live-preview#preview-targets), чтобы узнать больше.

Итак, в нашем случае мы должны просто установить нашу ссылку на наш сервер с включенной SSR (например, **Netlify**).

Также стоит упомянуть, что Statamic добавляет два дополнительных параметра в URL `live-preview` и `token`. Благодаря им **Statamic** может иметь дело с данными без сохранения.

Итак, после подключения всего, мы можем это увидеть... данные не обновляются.

![Пример, в котором не отображается заголовок](https://maciekpalmowski.dev/assets/arts/statamic-astro-previews/statamic-astro.gif)

Почему? Потому что мы забыли о прохождении параметров live-preview и token. Исправление простое:

```js
---
const API_URL = 'YOUR DOMAIN';
const is_preview = import.meta.env.PREVIEW;
let post = {};

export async function getStaticPaths() {
    const res = await fetch( `${API_URL}/collections/pages/entries/` );
    const posts = res.json();
    return posts.data.map((post) => {
		return {
			params: { slug: post.slug },
			props: { post } };
		}
	);
}

if ( is_preview ) {
	const url = new URL(Astro.request.url);
	const params = new URLSearchParams(url.search);

	post = await fetch( `${API_URL}/collections/pages/entries/` + `${Astro.params.slug}` + '?token=' + `${params.get('token')}` + '&live-preview=' + `${params.get('live-preview')}` );
	const res = await post.json();
	post = await res.data;
} else {
	const {post} = Astro.props;

}
---
<html>
	<head>
		<title>{post.title}</title>
	</head>

	<body>
		<main>
			<article>
				<h1 >{post.title}</h1>
				<div set:html={post.content}></div>
			</article>
		</main>
	</body>
</html>
```

Теперь все должно работать.

## Как должна выглядеть финальная установка?

В моем случае это выглядит так:

1. Сервер со **Statamic**
1. Одна учетная запись **Netlify**, где у меня есть окончательная статическая версия сайта
1. Еще одна бесплатная учетная запись **Netlify**, где у меня есть версия SSR
1. И, конечно же, **Buddy**, чтобы автоматизировать все это.

Данная статья является переводом [другой статьи](https://maciekpalmowski.dev/implementing-live-previews-in-headless-statamic-when-using-astro/)
