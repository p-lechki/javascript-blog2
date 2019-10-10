'use strict';

const opts = {
  tagSizes: {
    count: 5,
    classPrefix: 'tag-size',
  },
};

const select = {
  all: {
    articles: '.post',
    linkTo: {
      tags: 'a[href^="tag-"]',
      authors: 'a[href^="#author-"]',
    },
  },
  article: {
    tags: '.post-tags .list',
    author: '.post-author',
  },
  listOf: {
    title: '.post-title',
    titles: '.titles',
    tags: '.tags.list',
    authors: '.authors.list',
  },
};

function generateTitleLinks(customSelector = '') {
  const titleList = document.querySelector(select.listOf.titles);

  /* remove contents of titleList */
  titleList.innerHTML = '';
  /* for each article */
  const articles = document.querySelectorAll(select.all.articles + customSelector);
  let html = '';
  for (let article of articles) {
    /* get the article id */
    const articleId = article.getAttribute('id');
    /* find the title element */
    const articleTitle = article.querySelector(select.listOf.title).innerHTML;
    /* get the title from the title element */

    /* create HTML of the link */
    const linkHTML = '<li><a href="#' + articleId + '"><span>' + articleTitle + '</span></a></li>';
    /* insert link into titleList */
    html += linkHTML;
  }

  titleList.innerHTML = html;

  const links = document.querySelectorAll('.titles a');

  for (let link of links) {
    link.addEventListener('click', titleClickHandler);
  }
}

generateTitleLinks();

function titleClickHandler(event) {
  event.preventDefault();
  const clickedElement = this;
  const activeLinks = document.querySelectorAll('.title a.active');

  /* remove class 'active' from all article links  */
  for (let activeLink of activeLinks) {
    activeLink.classList.remove('active');
  }
  /* add class 'active' to the clicked link */
  clickedElement.classList.add('active');

  /* remove class 'active' from all articles */
  const activeArticles = document.querySelectorAll('.post .active');
  for (let activeArticle of activeArticles) {
    activeArticle.classList.remove('active');
  }
  /* get 'href' attribute from the clicked link */
  const articleSelector = clickedElement.getAttribute('href');
  /* find the correct article using the selector (value of 'href' attribute) */
  const targetArticle = document.querySelector(articleSelector);
  /* add class 'active' to the correct article */
  targetArticle.classList.add('active');
}

function calculateTagsParams(tags) {
  const params = {
    max: 0,
    min: 999999
  };

  for (let tag in tags) {
    params.max = Math.max(tags[tag], params.max);
    params.min = Math.min(tags[tag], params.min);
  }

  return params;
}

function calculateTagsClass(count, params) {
  const classNumer = Math.floor(((count - params.min) / (params.max - params.min)) * opts.tagSizes.count + 1);
  return classNumer;
}

function generateTags() {
  /* [NEW] create a new variable allTags with an empty object */
  let allTags = {};

  /* find all articles */
  const articles = document.querySelectorAll(select.all.articles);
  /* START LOOP: for every article: */
  for (let article of articles) {
    /* find tags wrapper */
    const tagsList = article.querySelector(select.article.tags);
    /* make html variable with empty string */
    let html = '';
    /* get tags from data-tags attribute */
    const articleTags = article.getAttribute("data-tags");
    /* split tags into array */
    const articleTagsArray = articleTags.split(' ');
    /* START LOOP: for each tag */
    for (let tag of articleTagsArray) {
      /* generate HTML of the link */
      const linkHTML = '<li><a href="#tag-' + tag + '">' + tag + '</a></li> ';
      /* add generated code to html variable */
      html += linkHTML;
      /* [NEW] check if this link is NOT already in allTags */
      if (!allTags.hasOwnProperty(tag)) {
        /* [NEW] add tag to allTags object */
        allTags[tag] = 1;
      } else {
        allTags[tag]++;
      }
    }
    /* END LOOP: for each tag */

    /* insert HTML of all the links into the tags wrapper */
    tagsList.innerHTML = html;
  }
  /* END LOOP: for every article: */

  /* [NEW] find list of tags in right column */
  const tagList = document.querySelector(select.listOf.tags);

  const tagsParams = calculateTagsParams(allTags);
  console.log('tagsParams:', tagsParams);
  /* [NEW] create variable for all links HTML code */
  let allTagsHTML = '';

  // [NEW] START LOOP: for each tag in allTags
  for (let tag in allTags) {
    // [NEW] gemerate cod of a link and add it to allTagsHTML
    const tagLinkHTML = '<li><a href="#tag-' + tag + '"class="' + opts.tagSizes.classPrefix + calculateTagsClass(allTags[tag], tagsParams) + '">' + tag + ' </a></li>';
    allTagsHTML += tagLinkHTML;
  }
  // [NEW] END LOOP: for each tag in allTags

  // [NEW] add html form allTagsHTML to tagList
  tagList.innerHTML = allTagsHTML;

}

generateTags();

function tagClickHandler(event) {
  /* prevent default action for this event */
  event.preventDefault();
  /* make new constant named "clickedElement" and give it the value of "this" */
  const clickedElement = this;
  /* make a new constant "href" and read the attribute "href" of the clicked element */
  const href = clickedElement.getAttribute("href");
  /* make a new constant "tag" and extract tag from the "href" constant */
  const tag = href.replace('#tag-', '');
  /* find all tag links with class active */
  const tagsLinks = document.querySelectorAll('a.active[href^="#tag-"]');
  /* START LOOP: for each active tag link */
  for (let link of tagsLinks) {
    /* remove class active */
    link.classList.remove('active');
  }
  /* END LOOP: for each active tag link */

  /* find all tag links with "href" attribute equal to the "href" constant */
  const tagLinks = document.querySelectorAll('a[href="' + href + '"]');
  /* START LOOP: for each found tag link */
  for (let tag of tagLinks) {
    /* add class active */
    tag.classList.add('active');
  }
  /* END LOOP: for each found tag link */

  /* execute function "generateTitleLinks" with article selector as argument */
  generateTitleLinks('[data-tags~="' + tag + '"]');
}

function addClickListenersToTags() {
  /* find all links to tags */
  const tagsLinks = document.querySelectorAll('a[href^="#tag-"');
  /* START LOOP: for each link */
  for (let tagLink of tagsLinks) {
    /* add tagClickHandler as event listener for that link */
    tagLink.addEventListener('click', tagClickHandler);
  }
  /* END LOOP: for each link */
}

addClickListenersToTags();

function generateAuthors() {
  // [NEW] create a new variable allAuthors with an empty object
  let allAuthors = {};

  /* find all articles */
  const articles = document.querySelectorAll(select.all.articles);
  /* START LOOP: for every article: */
  for (let article of articles) {
    /* find author wrapper */
    const articleAuthor = article.querySelector(select.article.author);
    /* make html variable with empty string */
    let html = '';
    /* get author from data-author attribute */
    const author = article.getAttribute("data-author");
    const linkHTML = '<p>by <a href="#author-' + author + '">' + author + '</a></p>';
    /* add generated code to html variable */
    html += linkHTML;
    if (!allAuthors.hasOwnProperty(author)) {
      allAuthors[author] = 1;
    } else {
      allAuthors[author]++;
    }

    /* insert HTML of all the links into the author wrapper */
    articleAuthor.innerHTML = html;
  }
  /* END LOOP: for every article: */

  // [NEW] find list of authors in right column
  const authorsList = document.querySelector(select.listOf.authors);

  // [NEW] create variable for all links HTML code
  let allAuthorsHTML = '';

  // [NEW] START LOOP: for each author in authors
  for (let author in allAuthors) {
    // [NEW] genetarte cod of a linkand add it to allAuthorsHTML
    const autorLinkHTML = '<li><a href="#author-' + author + '"><span class="author-name">' + author + '</span></a></li>';
    allAuthorsHTML += autorLinkHTML;
  }
  // [NEW] END LOOP: for each author in allAuthors

  // [NEW] add html form allAuthorHTML
  authorsList.innerHTML = allAuthorsHTML;


}

generateAuthors();

function authorClickHandler(event) {
  /* prevent default action for this event */
  event.preventDefault();
  /* make new constant named "clickedElement" and give it the value of "this" */
  const clickedElement = this;
  /* make a new constant "href" and read the attribute "href" of the clicked element */
  const href = clickedElement.getAttribute("href");
  /* make a new constant "author" and extract tag from the "href" constant */
  const author = href.replace('#author-', '');
  /* find all tag links with class active */
  const authorLink = document.querySelectorAll('a.active[href^="' + href + '"');
  /* START LOOP: for each active tag link */
  for (let link of authorLink) {
    /* remove class active */
    link.classList.remove('active');
  }
  /* END LOOP: for each active tag link */

  /* find all authors links with "href" attribute equal to the "href" constant */
  const authorLinks = document.querySelectorAll('a[href="' + href + '"]');
  /* START LOOP: for each found tag link */
  for (let link of authorLinks) {
    /* add class active */
    link.classList.add('active');
  }
  /* END LOOP: for each found tag link */

  /* execute function "generateTitleLinks" with article selector as argument */
  generateTitleLinks('[data-author="' + author + '"]');
}

function addClickListenersToAuthors() {
  /* find all links to authors */
  const authorLinks = document.querySelectorAll('a[href^="#author-"');
  /* START LOOP: for each link */
  for (let link of authorLinks) {
    /* add tagClickHandler as event listener for that link */
    link.addEventListener('click', authorClickHandler);
  }
  /* END LOOP: for each link */
}

addClickListenersToAuthors();
