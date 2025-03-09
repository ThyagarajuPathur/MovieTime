import React from 'react';

const Search = ({searchTerm,setSearchTerm}) => {
    return (
        <div className="search">
            <div>
                <img src="search.svg" alt="search" />
                <input
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
                placeholder="Search through thousands of movies"/>
            </div>
        </div>
    );
};

export default Search;