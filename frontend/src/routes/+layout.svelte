<script>
	import Header from './Header.svelte'
	import { Container, Styles } from 'sveltestrap'
	import './styles.css'
</script>

<Styles icons={false} />

<div class="app">
	<Header/>
	<main>
		<slot/>
	</main>
	<section style="background-color: rgb(52, 58, 64);">
		<Container>
			<footer class="text-light d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
				<div class="d-flex align-items-center">
					<span class="mb-md-0">© {new Date().getFullYear()} ภาควิชาพยาธิวิทยา คณะแพทยศาสตร์ศิริราชพยาบาล</span>
				</div>
				<ul class="nav justify-content-end list-unstyled d-flex">
					<li class="ms-3"><a class="text-light" href="https://sites.google.com/view/sipatho/pathologist/%E0%B8%95%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B8%87%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%AD%E0%B8%B2%E0%B8%88%E0%B8%B2%E0%B8%A3%E0%B8%A2" target="_blank">ตารางงานอาจารย์</a></li>
				</ul>
			</footer>
		</Container>
	</section>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
